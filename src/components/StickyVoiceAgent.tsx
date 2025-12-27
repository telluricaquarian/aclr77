"use client";

import { StickyVoiceCta } from "@/components/ui/sticky-voice-cta";
import { getVapi } from "@/lib/vapi";
import { useCallback, useEffect, useRef } from "react";

export function StickyVoiceAgent() {
    const vapiRef = useRef<ReturnType<typeof getVapi> | null>(null);

    useEffect(() => {
        // Create once on client
        vapiRef.current = getVapi();
        return () => {
            // If SDK supports cleanup, do it safely
            try {
                // @ts-expect-error - optional depending on SDK version
                vapiRef.current?.stop?.();
            } catch { }
            vapiRef.current = null;
        };
    }, []);

    const handleClick = useCallback(async () => {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

        if (!publicKey || !assistantId) {
            console.error("Missing Vapi env vars:", {
                hasPublicKey: !!publicKey,
                hasAssistantId: !!assistantId,
            });
            return;
        }

        try {
            const vapi = vapiRef.current ?? getVapi();

            // vapi.start() API differs slightly across versions — these two patterns
            // cover the common cases. One of them will be correct for your SDK.
            try {
                // Pattern A (options object)
                // @ts-expect-error - depends on SDK types
                await vapi.start({ assistantId });
            } catch {
                // Pattern B (assistantId string)
                // @ts-expect-error - depends on SDK types
                await vapi.start(assistantId);
            }
        } catch (err) {
            console.error("Vapi start() failed:", err);
        }
    }, []);

    return <StickyVoiceCta label="Talk to an Areculateir Agent?" onClick={handleClick} />;
}
