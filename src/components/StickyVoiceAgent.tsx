// src/components/StickyVoiceAgent.tsx
"use client";

import { getVapi, safeOff } from "@/lib/vapi";
import { useEffect, useMemo, useRef, useState } from "react";

type AgentUiState = "idle" | "connecting" | "listening" | "talking" | "error";

function humanizeError(err: unknown) {
    const msg =
        typeof err === "string"
            ? err
            : (err as any)?.message || (err as any)?.toString?.() || "Unknown error";

    // Make common browser errors more readable
    if (msg.includes("NotAllowedError")) return "Microphone permission blocked. Enable mic access in browser settings.";
    if (msg.includes("NotFoundError")) return "No microphone found.";
    if (msg.toLowerCase().includes("public key")) return "Invalid/missing Vapi public key.";
    if (msg.toLowerCase().includes("assistant")) return "Invalid/missing assistant id.";

    return msg;
}

export default function StickyVoiceAgent() {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    const [uiState, setUiState] = useState<AgentUiState>("idle");
    const [errorText, setErrorText] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);

    // A small “talking” decay timer so transcript-based talking feels responsive
    const talkingTimer = useRef<number | null>(null);

    const vapi = useMemo(() => getVapi(), []);

    // Track whether we already bound listeners (avoid duplicates during re-renders)
    const listenersBound = useRef(false);

    useEffect(() => {
        if (!vapi || listenersBound.current) return;

        // --- Event handlers ---
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
            // In docs examples, speech-start/speech-end are used as real-time speech events. :contentReference[oaicite:1]{index=1}
            // We treat this as “listening”.
            setUiState("listening");
        };

        const onSpeechEnd = () => {
            // Back to listening/ready state
            if (isActive) setUiState("listening");
        };

        const onMessage = (message: any) => {
            // Vapi docs: message event contains transcript/function-call/etc. :contentReference[oaicite:2]{index=2}
            // We infer "talking" when we receive assistant transcript chunks.
            if (message?.type === "transcript") {
                if (message?.role === "assistant") {
                    setUiState("talking");

                    // decay back to listening shortly after
                    if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
                    talkingTimer.current = window.setTimeout(() => {
                        if (isActive) setUiState("listening");
                    }, 700);
                } else {
                    // user transcript => listening
                    if (isActive) setUiState("listening");
                }
            }
        };

        const onError = (err: any) => {
            console.error("Vapi error:", err);
            setIsActive(false);
            setUiState("error");
            setErrorText(humanizeError(err));
        };

        // --- Bind listeners ---
        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("message", onMessage);
        vapi.on("error", onError);

        listenersBound.current = true;

        // Cleanup (best-effort; SDK may or may not implement off())
        return () => {
            safeOff(vapi, "call-start", onCallStart);
            safeOff(vapi, "call-end", onCallEnd);
            safeOff(vapi, "speech-start", onSpeechStart);
            safeOff(vapi, "speech-end", onSpeechEnd);
            safeOff(vapi, "message", onMessage);
            safeOff(vapi, "error", onError);
            listenersBound.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vapi]);

    async function micPreflight() {
        if (!navigator?.mediaDevices?.getUserMedia) {
            throw new Error("Browser does not support microphone access (getUserMedia).");
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop tracks; we just want permission granted.
        stream.getTracks().forEach((t) => t.stop());
    }

    async function start() {
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

        // Ensure mic permission prompt happens due to user gesture click
        await micPreflight();

        // Start web call (browser voice) :contentReference[oaicite:3]{index=3}
        await vapi.start(assistantId);
    }

    async function stop() {
        try {
            setUiState("idle");
            setErrorText(null);
            setIsActive(false);

            if (talkingTimer.current) window.clearTimeout(talkingTimer.current);
            talkingTimer.current = null;

            if (vapi) {
                await vapi.stop();
            }
        } catch (err) {
            setUiState("error");
            setErrorText(humanizeError(err));
        }
    }

    async function toggle() {
        try {
            if (uiState === "connecting") return;

            if (isActive) {
                await stop();
            } else {
                await start();
            }
        } catch (err) {
            setUiState("error");
            setErrorText(humanizeError(err));
        }
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

                {/* “Orb” placeholder — swap this for the ElevenLabs Orb later */}
                <div className="mb-4 flex items-center justify-center">
                    <div
                        className={[
                            "h-28 w-28 rounded-full border border-white/10",
                            "bg-white/10 shadow-inner",
                            uiState === "talking" ? "animate-pulse" : "",
                            uiState === "connecting" ? "opacity-80" : "",
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
                        "w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                        "transition",
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
