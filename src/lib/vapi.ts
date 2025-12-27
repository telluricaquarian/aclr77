import Vapi from "@vapi-ai/web";

// Singleton so we don't create multiple instances per click/render
let vapiSingleton: Vapi | null = null;

export function getVapi() {
    // Only create on the client
    if (typeof window === "undefined") {
        throw new Error("getVapi() must be called on the client");
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
        throw new Error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
    }

    if (!vapiSingleton) {
        vapiSingleton = new Vapi(publicKey);
    }

    return vapiSingleton;
}
