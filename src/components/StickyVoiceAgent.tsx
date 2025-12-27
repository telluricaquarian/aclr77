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

function PlayIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M9 7.5v9l8-4.5-8-4.5Z" fill="currentColor" />
        </svg>
    );
}

function chipClass(active: boolean) {
    return [
        "rounded-lg px-3 py-1 text-[11px] font-medium",
        active ? "bg-white/15 text-white" : "bg-white/10 text-white/60",
    ].join(" ");
}

export function StickyVoiceAgent() {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "";
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";

    const [isOpen, setIsOpen] = useState(false);
    const [uiState, setUiState] = useState<AgentUiState>("idle");
    const [errorText, setErrorText] = useState<string>("");
    const [statusLine, setStatusLine] = useState<string>("");

    const vapiRef = useRef<VapiLike | null>(null);
    const handlersRef = useRef<Array<[string, VapiHandler]>>([]);

    const envOk = useMemo(() => {
        return Boolean(publicKey) && Boolean(assistantId);
    }, [publicKey, assistantId]);

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
                    if (typeof m.type === "string" && m.type.toLowerCase().includes("listening")) {
                        setUiState("listening");
                        setStatusLine("Listening…");
                    }
                    if (typeof m.type === "string" && m.type.toLowerCase().includes("speaking")) {
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

    /**
     * IMPORTANT FIX:
     * Close the UI immediately (optimistic close) and stop the session in the background.
     * This prevents iOS / audio teardown latency from making the close button feel broken.
     */
    const stopSession = useCallback(
        async (closeUi: boolean) => {
            const vapi = vapiRef.current;

            // ✅ instant UI close if requested
            if (closeUi) setIsOpen(false);

            cleanupListeners();

            try {
                if (vapi) await vapi.stop();
            } catch {
                // ignore stop errors
            } finally {
                setStatusLine("");
                setErrorText("");
                setUiState("idle");
            }
        },
        [cleanupListeners]
    );

    const startSession = useCallback(async () => {
        setIsOpen(true);
        setErrorText("");
        setStatusLine("Requesting microphone…");
        setUiState("connecting");

        if (!envOk) {
            setError("Missing env vars. Need NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID.");
            return;
        }

        const vapi = ensureVapi();
        if (!vapi) return;

        bindListeners(vapi);

        try {
            await vapi.start({ assistantId });
            setStatusLine("Connecting…");
        } catch (e1) {
            try {
                await vapi.start(assistantId);
                setStatusLine("Connecting…");
            } catch (e2) {
                setError(e2 ?? e1);
            }
        }
    }, [assistantId, bindListeners, envOk, ensureVapi, setError]);

    const toggleSession = useCallback(async () => {
        if (isActive) {
            await stopSession(false);
            return;
        }
        await startSession();
    }, [isActive, startSession, stopSession]);

    useEffect(() => {
        return () => {
            void stopSession(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Mobile centered, Desktop stays bottom-left
    const collapsedPos =
        "fixed bottom-6 z-50 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0";
    const expandedPos =
        "fixed bottom-6 z-50 w-[320px] max-w-[calc(100vw-3rem)] left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0";

    if (!isOpen) {
        return (
            <div className={collapsedPos}>
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

    return (
        <div className={expandedPos}>
            <div className="rounded-2xl border border-[#F28C28]/40 bg-white shadow-xl shadow-black/10">
                <div className="relative rounded-2xl bg-black p-4 text-white">
                    <div className="mb-3 pr-10">
                        <div className="text-sm font-semibold">Areculateir Agent:</div>
                        <div className="text-xs text-white/70">
                            {uiState === "error" ? "Error" : statusLine || "Ready"}
                        </div>
                    </div>

                    {/* ✅ Close button: absolute, bigger hitbox, always clickable */}
                    <button
                        type="button"
                        onClick={() => void stopSession(true)}
                        className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/15 active:scale-[0.98]"
                        aria-label="Close voice agent"
                        title="Close"
                    >
                        ✕
                    </button>

                    {/* Orb placeholder */}
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
                        onClick={() => void toggleSession()}
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
