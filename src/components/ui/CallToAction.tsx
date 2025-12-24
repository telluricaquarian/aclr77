"use client";

import QuoteModal from "@/components/ui/WaitlistModal";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../Button";

export function CallToAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section aria-labelledby="cta-title" className="mx-auto max-w-6xl">
        <div className="grid items-center gap-8 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <h2
              id="cta-title"
              className="scroll-my-60 text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl"
            >
              Ready to get started?
            </h2>
            <p className="mt-3 mb-8 text-lg text-gray-600">
              Start building your prototype A.S.A.P or talk to our team about your specific needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="text-md" onClick={() => setIsModalOpen(true)}>
                Start now
              </Button>
            </div>
          </div>

          {/* Media side */}
          <div className="relative isolate rounded-xl sm:col-span-4">
            {/* Give the media a definite height via aspect ratio */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
              {/* LCP-safe fallback poster image (loads instantly) */}
              <Image
                alt="Areculateir preview"
                src="/images/aclrthumb.png"
                fill
                priority
                sizes="(min-width: 640px) 66vw, 100vw"
                className="object-cover"
              />

              {/* Video enhancement (fades in once it can play) */}
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
                src="/images/aclr77thumb.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/images/aclrthumb.png"
                onCanPlay={(e) => {
                  e.currentTarget.classList.remove("opacity-0");
                }}
              />

              {/* Optional subtle glow (keeps the “glowy” vibe without a second video) */}
              <div className="pointer-events-none absolute inset-0 -z-10 blur-xl bg-black/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType="quote"
      />
    </>
  );
}

export default CallToAction;
