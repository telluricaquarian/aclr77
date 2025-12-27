// src/lib/vapi.ts
import Vapi from "@vapi-ai/web";

let vapiSingleton: Vapi | null = null;

export function getVapi(): Vapi | null {
    if (typeof window === "undefined") return null;
    if (vapiSingleton) return vapiSingleton;

    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
        console.error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
        return null;
    }

    vapiSingleton = new Vapi(publicKey);
    return vapiSingleton;
}
