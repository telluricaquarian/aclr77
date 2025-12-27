"use client";

import { useCallback, useEffect, useRef } from "react";

// ✅ Correct path: BOTH files live in src/components
import { StickyVoiceCta } from "./sticky-voice-cta";

// ✅ Your helper (we’ll make sure it exists in src/lib/vapi.ts below)
import { getVapi } from "@/lib/vapi";

export function StickyVoiceAgent() {
    const vapiRef = useRef<ReturnType<typeof getVapi> | null>(null);

    useEffect(() => {
        // Create once on the client
        vapiRef.current = getVapi();

        return () => {
            // Best-effort cleanup (SDK may or may not expose stop())
            try {
                (vapiRef.current as any)?.stop?.();
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
            const vapi = vapiRef.current ?? getVapi();

            // @vapi-ai/web v2.x typically supports start(assistantId)
            await (vapi as any).start(assistantId);
        } catch (err) {
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
