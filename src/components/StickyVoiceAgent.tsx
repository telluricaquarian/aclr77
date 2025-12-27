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
};

function formatErr(err: unknown): string {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;

    if (typeof err === "object") {
        const e = err as Record<string, unknown>;

        if (typeof e.message === "string" && e.message.trim()) return e.message;
        if (typeof e.error === "string" && e.error.trim()) return e.error;
        if (typeof e.reason === "string" && e.reason.trim()) return e.reason;

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

    const vapiRef = useRef<VapiLike | null>(null);
    const handlersRef = useRef<Array<[string, VapiHandler]>>([]);

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
                setErrorText("");
                setStatusLine("Connected");
                setUiState("listening");
            };

            const onCallEnd: VapiHandler = () => {
                setStatusLine("");
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

            const onError: VapiHandler = (err) => {
                setError(err);
            };

            const onMessage: VapiHandler = (msg) => {
                if (typeof msg === "string") setStatusLine(msg);

                if (typeof msg === "object" && msg) {
                    const m = msg as Record<string, unknown>;
                    if (
                        typeof m.type === "string" &&
                        m.type.toLowerCase().includes("listening")
                    ) {
                        setUiState("listening");
                        setStatusLine("Listening…");
                    }
                    if (
                        typeof m.type === "string" &&
                        m.type.toLowerCase().includes("speaking")
                    ) {
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

    const stopVapiOnly = useCallback(async () => {
        const vapi = vapiRef.current;
        cleanupListeners();
        try {
            if (vapi) await vapi.stop();
        } catch {
            // ignore stop errors
        }
    }, [cleanupListeners]);

    // ✅ UI-first close (works even if vapi.stop hangs)
    const closeUiInstant = useCallback(() => {
        setIsOpen(false);
        setStatusLine("");
        setErrorText("");
        setUiState("idle");
        void stopVapiOnly();
    }, [stopVapiOnly]);

    // ✅ UI-first end session (same philosophy)
    const endSessionInstant = useCallback(() => {
        setStatusLine("");
        setErrorText("");
        setUiState("idle");
        void stopVapiOnly();
    }, [stopVapiOnly]);

    const startSession = useCallback(async () => {
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
            return;
        }

        if (!isUuid(assistantId)) {
            setError(
                `Assistant ID is not a UUID after normalization.
Raw: "${rawAssistantId}"
Normalized: "${assistantId}"
Fix: Use the Assistant ID from Vapi (it should be "asst_<uuid>" or "<uuid>").`
            );
            return;
        }

        const vapi = ensureVapi();
        if (!vapi) return;

        bindListeners(vapi);

        try {
            await vapi.start(assistantId);
            setStatusLine("Connecting…");
        } catch (e) {
            setError(e);
        }
    }, [assistantId, bindListeners, envOk, ensureVapi, rawAssistantId, setError]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            void stopVapiOnly();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Collapsed pill
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 left-6 z-[9999] pointer-events-auto">
                <button
                    type="button"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void startSession();
                    }}
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
                "fixed z-[9999] pointer-events-auto w-[320px] max-w-[calc(100vw-3rem)]",
                "left-1/2 -translate-x-1/2 bottom-6",
                "md:left-6 md:translate-x-0",
            ].join(" ")}
        >
            <div className="rounded-2xl border border-[#F28C28]/40 bg-white shadow-xl shadow-black/10">
                <div className="rounded-2xl bg-black p-4 text-white">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold">Areculateir Agent:</div>
                            <div className="text-xs text-white/70">
                                {uiState === "error" ? "Error" : statusLine || "Ready"}
                            </div>
                        </div>

                        <button
                            type="button"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeUiInstant();
                            }}
                            className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/15"
                            aria-label="Close voice agent"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex items-center justify-center py-4">
                        <div
                            className={[
                                "h-28 w-28 rounded-full",
                                "bg-gradient-to-b from-[#5D7AA6] to-[#111827]",
                                "shadow-[inset_0_0_0_10px_rgba(255,255,255,0.06)]",
                                uiState === "talking" ? "animate-pulse" : "",
                                uiState === "listening" ? "ring-2 ring-white/40" : "",
                                uiState === "error" ? "ring-2 ring-red-500/70" : "",
                            ].join(" ")}
                        />
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
                    <button
                        type="button"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (isActive) {
                                endSessionInstant();
                            } else {
                                void startSession();
                            }
                        }}
                        className={[
                            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                            isActive
                                ? "bg-black text-white hover:bg-black/90"
                                : "bg-gray-100 text-black hover:bg-gray-200",
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
