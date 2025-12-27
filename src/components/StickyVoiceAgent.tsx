"use client";

import { StickyVoiceCta } from "@/components/sticky-voice-cta";
import { getVapi } from "@/lib/vapi";
import { useCallback, useEffect, useRef } from "react";

type VapiStartArg = string | { assistantId: string };

type VapiStartable = {
    start: (arg: VapiStartArg) => Promise<unknown>;
    stop?: () => void;
};

function asStartable(vapi: unknown): VapiStartable {
    return vapi as VapiStartable;
}

export function StickyVoiceAgent() {
    const vapiRef = useRef<unknown>(null);

    useEffect(() => {
        vapiRef.current = getVapi();

        return () => {
            try {
                const vapi = asStartable(vapiRef.current);
                vapi.stop?.();
            } catch {
                // ignore
            }
            vapiRef.current = null;
        };
    }, []);

    const handleClick = useCallback(async () => {
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

        if (!assistantId) {
            console.error("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID");
            return;
        }

        try {
            const vapiUnknown = vapiRef.current ?? getVapi();
            const vapi = asStartable(vapiUnknown);

            try {
                await vapi.start({ assistantId });
            } catch {
                await vapi.start(assistantId);
            }
        } catch (err: unknown) {
            console.error("Vapi start() failed:", err);
        }
    }, []);

    return (
        <StickyVoiceCta
            label="Talk to an Areculateir Agent?"
            onClick={handleClick}
        />
    );
}
