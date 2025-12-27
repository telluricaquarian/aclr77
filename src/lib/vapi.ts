import Vapi from "@vapi-ai/web";

let singleton: Vapi | null = null;

export function getVapi(): Vapi {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

    if (!publicKey) {
        throw new Error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
    }

    if (!singleton) {
        singleton = new Vapi(publicKey);
    }

    return singleton;
}
