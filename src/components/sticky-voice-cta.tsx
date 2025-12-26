"use client";

import { Phone } from "lucide-react";
import Link from "next/link";

type StickyVoiceCtaProps = {
    /** If you have a phone number, use this (e.g. "+16175551234") */
    phoneNumber?: string;
    /** If you want to open a web call widget/modal, use onClick instead of tel: */
    onClick?: () => void;
    /** Optional: show/hide the tooltip text */
    label?: string;
};

export function StickyVoiceCta({
    phoneNumber,
    onClick,
    label = "Want to talk to an Areculateir Agent?",
}: StickyVoiceCtaProps) {
    const content = (
        <div className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3">
            {/* Tooltip / pill */}
            <div
                className="
          hidden sm:flex items-center
          rounded-xl border border-orange-200/40 bg-white/90
          px-3 py-2 text-sm font-medium text-zinc-900
          shadow-lg backdrop-blur
          transition group-hover:shadow-xl
        "
            >
                <span className="whitespace-nowrap">{label}</span>
                <span className="ml-2 inline-block h-[1px] w-6 bg-orange-300/80" />
            </div>

            {/* Round button */}
            <div
                className="
          relative grid place-items-center
          h-16 w-16 rounded-full
          bg-white shadow-xl
          ring-1 ring-black/10
          transition
          group-hover:scale-[1.03]
        "
            >
                {/* Branded orange ring */}
                <div className="absolute inset-0 rounded-full ring-4 ring-orange-400/30" />

                {/* Icon */}
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white">
                    <Phone className="h-7 w-7 text-orange-500" strokeWidth={2.2} />
                </div>
            </div>
        </div>
    );

    // If you pass onClick, we use a button (web widget/modal)
    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label="Talk to an Areculateir Agent"
                className="contents"
            >
                {content}
            </button>
        );
    }

    // Otherwise default to tel: link
    const href = phoneNumber ? `tel:${phoneNumber}` : "#";

    return (
        <Link
            href={href}
            aria-label="Talk to an Areculateir Agent"
            className="contents"
            prefetch={false}
            onClick={(e) => {
                if (!phoneNumber) {
                    e.preventDefault();
                    console.warn(
                        "StickyVoiceCta: No phoneNumber provided. Pass phoneNumber or onClick."
                    );
                }
            }}
        >
            {content}
        </Link>
    );
}
