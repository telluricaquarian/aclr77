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
    label = "Talk to an Areculateir Agent?",
}: StickyVoiceCtaProps) {
    const content = (
        <div
            className="
        fixed bottom-5 right-5 z-[70]
        lg:left-5 lg:right-auto
      "
        >
            {/* Single pill CTA (icon inside) */}
            <div
                className="
          group inline-flex items-center gap-3
          rounded-xl border border-orange-200/40 bg-white/90
          px-4 py-3 text-sm font-medium text-zinc-900
          shadow-lg backdrop-blur
          transition
          hover:shadow-xl
          active:scale-[0.99]
          sm:px-4 sm:py-3
          lg:px-3 lg:py-2 lg:text-[13px]
        "
            >
                <span className="whitespace-nowrap">{label}</span>

                {/* Icon inside the pill */}
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-black/10">
                    <span className="absolute inset-0 rounded-full ring-4 ring-orange-400/30" />
                    <Phone className="h-5 w-5 text-orange-500" strokeWidth={2.2} />
                </span>
            </div>
        </div>
    );

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
