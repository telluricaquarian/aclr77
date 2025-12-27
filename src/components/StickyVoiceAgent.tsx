// src/components/StickyVoiceAgent.tsx
"use client";

import { getVapi } from "@/lib/vapi";
import type Vapi from "@vapi-ai/web";
import { useEffect, useMemo, useRef, useState } from "react";

type AgentUiState = "idle" | "connecting" | "listening" | "talking" | "error";

type TranscriptMessage = {
    type: "transcript";
    role: "assistant" | "user";
    transcript?: string;
};

type VapiMessage = TranscriptMessage | { type: string;[key: string]: unknown };

type VapiApi = {
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    start: (assistantId: string) => Promise<void> | void;
    stop: () => Promise<void> | void;
};

function formatErr(err: unknown): string {
    const msg =
        typeof err === "string"
            ? err
            : err && typeof err === "object" && "message" in err
                ? String((err as { message: unknown }).message)
                : "Unknown error";

    if (msg.includes("NotAllowedError"))
        return "Microphone permission blocked. Enable mic access in your browser settings.";
    if (msg.includes("NotFoundError")) return "No microphone found on this device.";
    if (msg.includes("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY"))
        return "Missing Vapi public key in env (NEXT_PUBLIC_VAPI_PUBLIC_KEY).";
    if (msg.includes("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID"))
        return "Missing Vapi assistant id in env (NEXT_PUBLIC_VAPI_ASSISTANT_ID).";

    return msg;
}

async function micPreflight(): Promise<void> {
    if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support microphone access.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
}

function StateChip({
    label,
    active,
}: {
    label: string;
    active?: boolean;
}) {
    return (
        <div
            className={[
                "rounded-md px-3 py-1 text-[11px] font-medium",
                active
                    ? "bg-black text-white"
                    : "bg-black/10 text-black/60",
            ].join(" ")}
        >
            {label}
        </div>
    );
}

function PlayIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
                d="M9 7.5v9l8-4.5-8-4.5Z"
                fill="currentColor"
            />
        </svg>
    );
}

function PhoneLikeOrb({ state }: { state: AgentUiState }) {
    const anim =
        state === "talking"
            ? "animate-[spin_2.2s_linear_infinite]"
            : state === "listening"
                ? "animate-pulse"
                : "";

    // Conic gradient “petals” look, similar vibe to ElevenLabs orb (no three.js)
    return (
        <div className="relative grid place-items-center">
            <div className="absolute inset-0 rounded-full bg-black/40 blur-xl" />
            <div
                className={[
                    "relative h-24 w-24 rounded-full",
                    "ring-1 ring-white/20",
                    "bg-[conic-gradient(from_210deg,rgba(157,192,255,0.0),rgba(157,192,255,0.85),rgba(84,129,255,0.0),rgba(157,192,255,0.85),rgba(84,129,255,0.0))]",
                    anim,
                ].join(" ")}
            />
            <div className="absolute h-28 w-28 rounded-full ring-1 ring-white/10" />
        </div>
    );
}

export function StickyVoiceAgent() {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    const vapi = useMemo(() => getVapi(), []) as Vapi | null;
    const api = (vapi as unknown as VapiApi) || null;

    const [expanded, setExpanded] = useState(false);
    const [uiState, setUiState] = useState<AgentUiState>("idle");
    const [errorText, setErrorText] = useState<string | null>(null);
    const [statusLine, setStatusLine] = useState<string>("");

    const boundRef = useRef(false);
    const activeRef = useRef(false);
    const talkingTimer = useRef<number | null>(null);

    useEffect(() => {
        if (!api || boundRef.current) return;

        const onCallStart = () => {
            activeRef.current = true;
            setErrorText(null);
            setUiState("listening");
            setStatusLine("Session started.");
        };

        const onCallEnd = () => {
            activeRef.current = false;
            setUiState("idle");
            setStatusLine("");
            if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
            talkingTimer.current = null;
        };

        const onMessage = (message: unknown) => {
            const m = message as VapiMessage;

            if (m?.type === "transcript") {
                const tm = m as TranscriptMessage;

                if (tm.role === "assistant") {
                    setUiState("talking");
                    setStatusLine(`"Tara" is speaking…`);
                    if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
                    talkingTimer.current = window.setTimeout(() => {
                        if (activeRef.current) {
                            setUiState("listening");
                            setStatusLine("Listening…");
                        }
                    }, 800);
                } else {
                    if (activeRef.current) {
                        setUiState("listening");
                        setStatusLine("Listening…");
                    }
                }
            }
        };

        const onError = (err: unknown) => {
            console.error("Vapi error:", err);
            activeRef.current = false;
            setUiState("error");
            setErrorText(formatErr(err));
            setStatusLine("");
        };

        api.on("call-start", onCallStart);
        api.on("call-end", onCallEnd);
        api.on("message", onMessage);
        api.on("error", onError);

        boundRef.current = true;
    }, [api]);

    async function startSession() {
        try {
            if (!api) throw new Error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
            if (!assistantId) throw new Error("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID");

            setExpanded(true);
            setErrorText(null);
            setUiState("connecting");
            setStatusLine("Requesting microphone…");

            await micPreflight();

            setStatusLine("Connecting…");
            await api.start(assistantId);

            // If events don’t arrive quickly, don’t strand in “connecting”
            window.setTimeout(() => {
                setUiState((s) => (s === "connecting" ? "listening" : s));
                setStatusLine((t) => (t === "Connecting…" ? "Listening…" : t));
            }, 1500);
        } catch (err) {
            setUiState("error");
            setErrorText(formatErr(err));
        }
    }

    async function endSession() {
        try {
            setErrorText(null);
            setUiState("idle");
            setStatusLine("");

            if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
            talkingTimer.current = null;

            if (api) await api.stop();

            setExpanded(false);
        } catch (err) {
            setUiState("error");
            setErrorText(formatErr(err));
        }
    }

    const isActive = uiState === "connecting" || uiState === "listening" || uiState === "talking";

    // === Collapsed pill (matches your “before interaction”) ===
    if (!expanded) {
        return (
            <div className="fixed bottom-6 left-6 z-50">
                <button
                    onClick={startSession}
                    className={[
                        "group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-lg transition",
                        "border-[#F28C28]/40 hover:border-[#F28C28]/70",
                    ].join(" ")}
                >
                    <span className="text-sm font-medium text-black/85">
                        Start Session with an Areculateir Agent?
                    </span>

                    <span
                        className={[
                            "grid h-8 w-8 place-items-center rounded-full border transition",
                            "border-[#F28C28]/50 text-[#F28C28] group-hover:border-[#F28C28]/80",
                        ].join(" ")}
                        aria-hidden="true"
                    >
                        <PlayIcon />
                    </span>
                </button>
            </div>
        );
    }

    // === Expanded card (matches your “opens into”) ===
    return (
        <div className="fixed bottom-6 left-6 z-50 w-[320px] max-w-[calc(100vw-3rem)]">
            {/* outer white card w/ orange border */}
            <div className="rounded-2xl border border-[#F28C28]/55 bg-white shadow-2xl">
                {/* inner dark panel */}
                <div className="m-3 rounded-2xl bg-[#111] p-4 text-white">
                    <div className="mb-3">
                        <div className="text-sm font-semibold">Areculateir Agent:</div>
                        <div className="text-xs text-white/70">
                            {uiState === "error" ? "Error" : statusLine || "Ready"}
                        </div>
                    </div>

                    <div className="mb-4 flex items-center justify-center">
                        <PhoneLikeOrb state={uiState} />
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <div className="rounded-lg bg-white/10 p-1">
                            <div className="flex gap-2">
                                <div
                                    className={[
                                        "rounded-md px-3 py-1 text-[11px] font-medium",
                                        uiState === "idle" ? "bg-white text-black" : "bg-white/10 text-white/70",
                                    ].join(" ")}
                                >
                                    Idle
                                </div>
                                <div
                                    className={[
                                        "rounded-md px-3 py-1 text-[11px] font-medium",
                                        uiState === "listening" ? "bg-white text-black" : "bg-white/10 text-white/70",
                                    ].join(" ")}
                                >
                                    Listening
                                </div>
                                <div
                                    className={[
                                        "rounded-md px-3 py-1 text-[11px] font-medium",
                                        uiState === "talking" ? "bg-white text-black" : "bg-white/10 text-white/70",
                                    ].join(" ")}
                                >
                                    Talking
                                </div>
                            </div>
                        </div>
                    </div>

                    {errorText ? (
                        <div className="mt-3 rounded-xl bg-red-500/15 p-3 text-xs text-red-200">
                            {errorText}
                        </div>
                    ) : null}
                </div>

                {/* footer */}
                <div className="px-4 pb-4">
                    <button
                        onClick={isActive ? endSession : startSession}
                        disabled={uiState === "connecting"}
                        className={[
                            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                            isActive
                                ? "bg-black text-white hover:bg-black/90"
                                : "bg-black/10 text-black hover:bg-black/15",
                            uiState === "connecting" ? "cursor-not-allowed opacity-70" : "",
                        ].join(" ")}
                    >
                        {isActive ? "End session" : "Start session"}
                    </button>

                    <div className="mt-3 text-[11px] text-[#F28C28]">
                        Your session has started and is being recorded…
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export default too (so any import style still works)
export default StickyVoiceAgent;
