"use client";

import * as React from "react";

const STORAGE_KEY = "aclr77_cookie_consent_v1";

export function CookieConsent() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        try {
            const v = window.localStorage.getItem(STORAGE_KEY);
            if (!v) setOpen(true);
        } catch {
            // ignore
        }
    }, []);

    function acceptAll() {
        try {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
        } catch {
            // ignore
        }
        setOpen(false);
    }

    function deny() {
        try {
            window.localStorage.setItem(STORAGE_KEY, "denied");
        } catch {
            // ignore
        }
        setOpen(false);
    }

    if (!open) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[80] w-[min(420px,calc(100vw-2rem))] rounded-2xl border bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-zinc-900">We use cookies</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                        We may place cookies to analyze traffic and improve your experience. You can accept all
                        cookies or deny non-essential cookies.
                    </p>
                </div>
                <button
                    onClick={() => setOpen(false)}
                    aria-label="Close cookie banner"
                    className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
                >
                    ✕
                </button>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={acceptAll}
                    className="flex-1 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white hover:opacity-90"
                >
                    Accept all
                </button>
                <button
                    onClick={deny}
                    className="flex-1 rounded-lg border px-4 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                >
                    Deny
                </button>
            </div>
        </div>
    );
}
