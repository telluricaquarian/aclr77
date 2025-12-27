"use client";

import { StickyVoiceCta } from "@/components/ui/sticky-voice-cta";
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
        // Create once on client
        vapiRef.current = getVapi();

        return () => {
            // Best-effort cleanup (SDK may or may not expose stop())
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

            // SDK variants: try object form first, then string form
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
