"use client";

import { getVapi } from "@/lib/vapi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AgentUiState = "idle" | "connecting" | "listening" | "talking" | "error";

type VapiHandler = (...args: unknown[]) => void;

type VapiLike = {
    start: (arg: unknown) => Promise<unknown> | unknown;
    stop: () => Promise<unknown> | unknown;
    on: (event: string, handler: VapiHandler) => void;
    off?: (event: string, handler: VapiHandler) => void;

    // Some Vapi SDK builds expose these:
    endCall?: () => Promise<unknown> | unknown;
    hangup?: () => Promise<unknown> | unknown;
};

function formatErr(err: unknown): string {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;

    if (typeof err === "object") {
        const e = err as Record<string, unknown>;

        if (typeof e.message === "string" && e.message.trim()) return e.message;
        if (typeof e.error === "string" && e.error.trim()) return e.error;
        if (typeof e.reason === "string" && e.reason.trim()) return e.reason;

        if (e.message && typeof e.message !== "string") {
            try {
                const m = JSON.stringify(e.message);
                if (m && m !== "{}" && m !== "[]") return m;
            } catch { }
        }

        if (typeof e.status === "number" && typeof e.statusText === "string") {
            return `Request failed: ${e.status} ${e.statusText}`;
        }

        try {
            const json = JSON.stringify(e);
            return json.length > 2 ? json : "Unknown error";
        } catch {
            return "Unknown error (non-serializable)";
        }
    }

    return String(err);
}

function normalizeAssistantId(raw: string): string {
    const trimmed = (raw ?? "").trim();
    if (trimmed.startsWith("asst_")) return trimmed.slice("asst_".length);
    return trimmed;
}

function isUuid(v: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        v
    );
}

function PlayIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M9 7.5v9l8-4.5-8-4.5Z" fill="currentColor" />
        </svg>
    );
}

export function StickyVoiceAgent() {
    const rawAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "";
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";

    const assistantId = useMemo(
        () => normalizeAssistantId(rawAssistantId),
        [rawAssistantId]
    );

    const [isOpen, setIsOpen] = useState(false);
    const [uiState, setUiState] = useState<AgentUiState>("idle");
    const [errorText, setErrorText] = useState<string>("");
    const [statusLine, setStatusLine] = useState<string>("");
    const [isStopping, setIsStopping] = useState(false);

    const vapiRef = useRef<VapiLike | null>(null);
    const handlersRef = useRef<Array<[string, VapiHandler]>>([]);

    // Video ref so we can play/pause reliably (esp. iOS)
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Prevent reopen races while we are closing/stopping
    const closingRef = useRef(false);

    // Track whether a session was actually started/active (helps "double stop" logic)
    const sessionRef = useRef<"idle" | "starting" | "active">("idle");

    const envOk = useMemo(() => {
        return Boolean(publicKey) && Boolean(rawAssistantId);
    }, [publicKey, rawAssistantId]);

    const isActive =
        uiState === "connecting" || uiState === "listening" || uiState === "talking";

    const cleanupListeners = useCallback(() => {
        const vapi = vapiRef.current;
        if (!vapi) return;

        const off = vapi.off;
        if (typeof off === "function") {
            for (const [evt, fn] of handlersRef.current) off(evt, fn);
        }
        handlersRef.current = [];
    }, []);

    const setError = useCallback((err: unknown) => {
        const msg = formatErr(err);
        setUiState("error");
        setErrorText(msg);
        setStatusLine("");
    }, []);

    const ensureVapi = useCallback((): VapiLike | null => {
        try {
            const instance = getVapi() as unknown;
            const v = instance as VapiLike;

            if (
                !v ||
                typeof v.start !== "function" ||
                typeof v.stop !== "function" ||
                typeof v.on !== "function"
            ) {
                setError("Vapi SDK not initialized correctly (missing methods).");
                return null;
            }

            vapiRef.current = v;
            return v;
        } catch (e) {
            setError(e);
            return null;
        }
    }, [setError]);

    const bindListeners = useCallback(
        (vapi: VapiLike) => {
            cleanupListeners();

            const onCallStart: VapiHandler = () => {
                sessionRef.current = "active";
                setErrorText("");
                setStatusLine("Connected");
                setUiState("listening");
            };

            const onCallEnd: VapiHandler = () => {
                sessionRef.current = "idle";
                setStatusLine("");
                setErrorText("");
                setUiState("idle");
            };

            const onSpeechStart: VapiHandler = () => {
                setUiState("talking");
                setStatusLine("Speaking…");
            };

            const onSpeechEnd: VapiHandler = () => {
                setUiState("listening");
                setStatusLine("Listening…");
            };

            const onError: VapiHandler = (err) => setError(err);

            const onMessage: VapiHandler = (msg) => {
                if (typeof msg === "string") setStatusLine(msg);

                if (typeof msg === "object" && msg) {
                    const m = msg as Record<string, unknown>;
                    const t = typeof m.type === "string" ? m.type.toLowerCase() : "";

                    if (t.includes("listening")) {
                        setUiState("listening");
                        setStatusLine("Listening…");
                    } else if (t.includes("speaking") || t.includes("talking")) {
                        setUiState("talking");
                        setStatusLine("Speaking…");
                    }
                }
            };

            const pairs: Array<[string, VapiHandler]> = [
                ["call-start", onCallStart],
                ["call:end", onCallEnd],
                ["call-end", onCallEnd],
                ["call:ended", onCallEnd],
                ["call-stop", onCallEnd],
                ["call-stopped", onCallEnd],
                ["speech-start", onSpeechStart],
                ["speech-end", onSpeechEnd],
                ["error", onError],
                ["message", onMessage],
            ];

            for (const [evt, fn] of pairs) {
                try {
                    vapi.on(evt, fn);
                    handlersRef.current.push([evt, fn]);
                } catch {
                    // ignore unknown event names
                }
            }
        },
        [cleanupListeners, setError]
    );

    const stopVapiHard = useCallback(async (vapi: VapiLike | null) => {
        if (!vapi) return;

        // Try stop/endCall/hangup — different SDK builds expose different names.
        try {
            await vapi.stop();
            return;
        } catch { }

        try {
            if (typeof vapi.endCall === "function") {
                await vapi.endCall();
                return;
            }
        } catch { }

        try {
            if (typeof vapi.hangup === "function") {
                await vapi.hangup();
                return;
            }
        } catch { }

        // One more attempt at stop (some SDKs throw first time during connecting)
        try {
            await vapi.stop();
        } catch { }
    }, []);

    /**
     * Single source of truth for hanging up.
     * Close button and End Session should BOTH end the call.
     */
    const hangUp = useCallback(
        async (closeUi: boolean) => {
            if (isStopping) return;
            setIsStopping(true);
            closingRef.current = closeUi ? true : closingRef.current;

            // Snapshot whether we were mid-start or active BEFORE resetting state/ref
            const wasSession = sessionRef.current !== "idle";

            // Immediately prevent re-open races
            sessionRef.current = "idle";

            // ✅ Close immediately if requested (so UI collapses instantly)
            if (closeUi) setIsOpen(false);

            try {
                const vapi = vapiRef.current ?? ensureVapi();

                // Optimistic UI reset
                setStatusLine("");
                setErrorText("");
                setUiState("idle");

                // Attempt stop #1
                await stopVapiHard(vapi);

                // If we were starting/active, some SDK states benefit from a second stop
                if (wasSession) {
                    await new Promise((r) => setTimeout(r, 300));
                    await stopVapiHard(vapi);
                }

                // Now clean up listeners (post-stop)
                cleanupListeners();
            } finally {
                setIsStopping(false);
                if (closeUi) {
                    setTimeout(() => {
                        closingRef.current = false;
                    }, 0);
                }
            }
        },
        [cleanupListeners, ensureVapi, isStopping, stopVapiHard]
    );

    const startSession = useCallback(async () => {
        if (closingRef.current) return;

        sessionRef.current = "starting";
        setIsOpen(true);
        setErrorText("");
        setStatusLine("Requesting microphone…");
        setUiState("connecting");

        if (!envOk) {
            setError(
                `Missing env vars. Ensure BOTH are set and redeployed:
- NEXT_PUBLIC_VAPI_PUBLIC_KEY
- NEXT_PUBLIC_VAPI_ASSISTANT_ID`
            );
            sessionRef.current = "idle";
            return;
        }

        if (!isUuid(assistantId)) {
            setError(
                `Assistant ID is not a UUID after normalization.
Raw: "${rawAssistantId}"
Normalized: "${assistantId}"
Fix: Use the Assistant ID from Vapi (it should be "asst_<uuid>" or "<uuid>").`
            );
            sessionRef.current = "idle";
            return;
        }

        const vapi = ensureVapi();
        if (!vapi) {
            sessionRef.current = "idle";
            return;
        }

        bindListeners(vapi);

        try {
            // Some SDKs accept a string UUID, others accept { assistantId }.
            try {
                await vapi.start(assistantId);
            } catch {
                await vapi.start({ assistantId });
            }
            setStatusLine("Connecting…");
        } catch (e) {
            sessionRef.current = "idle";
            setError(e);
        }
    }, [assistantId, bindListeners, envOk, ensureVapi, rawAssistantId, setError]);

    const toggleSession = useCallback(async () => {
        if (isActive) {
            // End session should HANG UP but keep UI open
            await hangUp(false);
            return;
        }
        await startSession();
    }, [hangUp, isActive, startSession]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            void hangUp(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Play/pause the MP4 based on agent state
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        if (uiState === "talking" || uiState === "listening" || uiState === "connecting") {
            void v.play().catch(() => { });
        } else {
            v.pause();
            try {
                v.currentTime = 0;
            } catch { }
        }
    }, [uiState]);

    // Collapsed pill
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 left-6 z-50">
                <button
                    type="button"
                    onClick={() => void startSession()}
                    className="group inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-3 shadow-lg shadow-black/10 transition hover:shadow-xl"
                    aria-label="Start voice session"
                >
                    <span className="text-sm font-semibold text-black">
                        Start Session with an Areculateir Agent
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white">
                        <span className="text-black">
                            <PlayIcon />
                        </span>
                    </span>
                </button>
            </div>
        );
    }

    // Expanded card
    return (
        <div
            className={[
                "fixed z-50 w-[320px] max-w-[calc(100vw-3rem)]",
                "md:left-6 md:bottom-6 md:top-auto md:-translate-x-0 md:-translate-y-0",
                "max-sm:left-1/2 max-sm:top-1/2 max-sm:bottom-auto max-sm:-translate-x-1/2 max-sm:-translate-y-1/2",
            ].join(" ")}
        >
            <div className="relative rounded-2xl border border-[#F28C28]/40 bg-white shadow-xl shadow-black/10">
                {/* Close button: MUST hang up + close UI */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void hangUp(true); // ✅ ends call + collapses UI
                    }}
                    className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-black shadow-lg hover:bg-gray-50"
                    aria-label="Close voice agent"
                    title="Close"
                >
                    ✕
                </button>

                <div className="rounded-2xl bg-black p-4 text-white">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold">Areculateir Agent:</div>
                            <div className="text-xs text-white/70">
                                {uiState === "error" ? "Error" : statusLine || "Ready"}
                            </div>
                        </div>
                    </div>

                    {/* MP4 "Orb" */}
                    <div className="flex items-center justify-center py-4">
                        <div className="bg-muted relative h-28 w-28 rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]">
                            <div className="bg-black/40 h-full w-full overflow-hidden rounded-full">
                                <video
                                    ref={videoRef}
                                    className="h-full w-full object-cover"
                                    src="/images/taraspeaking.mp4"
                                    muted
                                    playsInline
                                    loop
                                    preload="auto"
                                    aria-label="Areculateir agent animation"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <span className={chipClass(uiState === "idle")}>Idle</span>
                        <span className={chipClass(uiState === "listening")}>Listening</span>
                        <span className={chipClass(uiState === "talking")}>Talking</span>
                    </div>

                    {uiState === "error" ? (
                        <div className="mt-3 rounded-xl bg-red-950/60 px-3 py-2 text-xs text-red-100">
                            {errorText || "Unknown error"}
                        </div>
                    ) : null}
                </div>

                <div className="p-4">
                    {/* End session: MUST hang up, but keep UI open */}
                    <button
                        type="button"
                        disabled={isStopping}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void toggleSession();
                        }}
                        className={[
                            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                            isActive
                                ? "bg-black text-white hover:bg-black/90"
                                : "bg-gray-100 text-black hover:bg-gray-200",
                            isStopping ? "cursor-not-allowed opacity-60" : "",
                        ].join(" ")}
                    >
                        {isActive ? "End session" : "Start session"}
                    </button>

                    {isActive ? (
                        <div className="mt-3 text-[11px] text-[#F28C28]">
                            Your session has started and is being recorded…
                        </div>
                    ) : (
                        <div className="mt-3 text-[11px] text-black/50">
                            Browser voice session (no phone number required).
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function chipClass(active: boolean) {
    return [
        "rounded-lg px-3 py-1 text-[11px] font-medium",
        active ? "bg-white/15 text-white" : "bg-white/10 text-white/60",
    ].join(" ");
}
