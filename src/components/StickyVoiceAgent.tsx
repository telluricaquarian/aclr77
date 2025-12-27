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

type VapiOn = {
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    stop: () => Promise<void> | void;
    start: (assistantId: string) => Promise<void> | void;
};

function humanizeError(err: unknown): string {
    const msg =
        typeof err === "string"
            ? err
            : err && typeof err === "object" && "message" in err
                ? String((err as { message: unknown }).message)
                : "Unknown error";

    if (msg.includes("NotAllowedError"))
        return "Microphone permission blocked. Enable mic access in browser settings.";
    if (msg.includes("NotFoundError")) return "No microphone found.";
    return msg;
}

async function micPreflight(): Promise<void> {
    if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Browser does not support microphone access (getUserMedia).");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
}

export function StickyVoiceAgent() {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    const [uiState, setUiState] = useState<AgentUiState>("idle");
    const [errorText, setErrorText] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);

    const talkingTimer = useRef<number | null>(null);
    const boundRef = useRef(false);

    const vapi = useMemo(() => getVapi(), []) as Vapi | null;

    useEffect(() => {
        if (!vapi || boundRef.current) return;

        const api = vapi as unknown as VapiOn;

        const onCallStart = () => {
            setIsActive(true);
            setErrorText(null);
            setUiState("listening");
        };

        const onCallEnd = () => {
            setIsActive(false);
            setErrorText(null);
            setUiState("idle");
            if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
            talkingTimer.current = null;
        };

        const onSpeechStart = () => {
            setUiState("listening");
        };

        const onSpeechEnd = () => {
            if (isActive) setUiState("listening");
        };

        const onMessage = (message: unknown) => {
            const m = message as VapiMessage;
            if (m?.type === "transcript") {
                const tm = m as TranscriptMessage;
                if (tm.role === "assistant") {
                    setUiState("talking");
                    if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
                    talkingTimer.current = window.setTimeout(() => {
                        if (isActive) setUiState("listening");
                    }, 700);
                } else {
                    if (isActive) setUiState("listening");
                }
            }
        };

        const onError = (err: unknown) => {
            console.error("Vapi error:", err);
            setIsActive(false);
            setUiState("error");
            setErrorText(humanizeError(err));
        };

        api.on("call-start", onCallStart);
        api.on("call-end", onCallEnd);
        api.on("speech-start", onSpeechStart);
        api.on("speech-end", onSpeechEnd);
        api.on("message", onMessage);
        api.on("error", onError);

        boundRef.current = true;

        // We intentionally do NOT attempt to unbind, because different SDK
        // versions may not provide `off`. This avoids build/runtime mismatch.
    }, [vapi, isActive]);

    async function start(): Promise<void> {
        if (!vapi) {
            setUiState("error");
            setErrorText("Vapi SDK not initialized. Check NEXT_PUBLIC_VAPI_PUBLIC_KEY.");
            return;
        }
        if (!assistantId) {
            setUiState("error");
            setErrorText("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID.");
            return;
        }

        setErrorText(null);
        setUiState("connecting");

        await micPreflight();

        const api = vapi as unknown as VapiOn;
        await api.start(assistantId);

        // If events fire, state will move to listening.
        // If they don't, at least we won't be stuck on connecting forever:
        window.setTimeout(() => {
            setUiState((s) => (s === "connecting" ? "listening" : s));
        }, 1200);
    }

    async function stop(): Promise<void> {
        try {
            setUiState("idle");
            setErrorText(null);
            setIsActive(false);

            if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
            talkingTimer.current = null;

            if (vapi) {
                const api = vapi as unknown as VapiOn;
                await api.stop();
            }
        } catch (err) {
            setUiState("error");
            setErrorText(humanizeError(err));
        }
    }

    async function toggle(): Promise<void> {
        if (uiState === "connecting") return;
        if (isActive) return stop();
        return start();
    }

    const statusLabel =
        uiState === "idle"
            ? "Idle"
            : uiState === "connecting"
                ? "Connecting…"
                : uiState === "listening"
                    ? "Listening"
                    : uiState === "talking"
                        ? "Talking"
                        : "Error";

    return (
        <div className="fixed bottom-6 left-6 z-50 w-[320px] max-w-[calc(100vw-3rem)]">
            <div className="rounded-3xl bg-black p-4 text-white shadow-2xl">
                <div className="mb-3">
                    <div className="text-sm font-semibold">Areculateir Agent</div>
                    <div className="text-xs text-white/70">{statusLabel}</div>
                </div>

                <div className="mb-4 flex items-center justify-center">
                    <div
                        className={[
                            "h-28 w-28 rounded-full border border-white/10 bg-white/10 shadow-inner",
                            uiState === "talking" ? "animate-pulse" : "",
                            uiState === "error" ? "ring-2 ring-red-500/60" : "",
                        ].join(" ")}
                        aria-label="Voice orb"
                    />
                </div>

                {errorText ? (
                    <div className="mb-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-200">
                        {errorText}
                    </div>
                ) : null}

                <button
                    onClick={toggle}
                    className={[
                        "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        isActive ? "bg-white text-black hover:bg-white/90" : "bg-white/10 hover:bg-white/15",
                        uiState === "connecting" ? "cursor-not-allowed opacity-70" : "",
                    ].join(" ")}
                    disabled={uiState === "connecting"}
                >
                    {isActive ? "End voice session" : "Talk to an Areculateir Agent"}
                </button>

                <div className="mt-3 text-[11px] text-white/50">
                    Browser voice session (no phone number required).
                </div>
            </div>
        </div>
    );
}

// Also export default so ANY import style works:
export default StickyVoiceAgent;
