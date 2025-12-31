"use client";

import QuoteModal from "@/components/ui/WaitlistModal";
import { RiArrowRightUpLine } from "@remixicon/react";
import Image from "next/image";
import { useState } from "react";
import { FadeContainer, FadeDiv, FadeSpan } from "../Fade";
import { HeroVideoDialog } from "./hero-video-dialog";
import GameOfLife from "./HeroBackground";

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section aria-label="hero">
      <FadeContainer className="relative flex flex-col items-center justify-center">
        {/* Logo above the pill CTA (mobile-first) */}
        <FadeDiv className="mx-auto mb-4 flex w-full justify-center sm:mb-6">
          <Image
            src="/images/Aaisolate.png"
            alt="Areculateir Aa mark"
            width={220}
            height={220}
            priority
            className="h-12 w-auto select-none sm:h-14 md:h-16"
          />
        </FadeDiv>

        <FadeDiv className="mx-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Build something you are proud of"
            className="mx-auto w-full"
          >
            <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-white/5 px-2.5 py-0.5 pr-3 pl-0.5 font-medium text-gray-900 ring-1 shadow-lg shadow-orange-400/20 ring-black/10 filter backdrop-blur-[1px] transition-colors hover:bg-orange-500/2.5 focus:outline-hidden sm:text-sm cursor-pointer">
              <span className="shrink-0 truncate rounded-full border bg-gray-50 px-2.5 py-1 text-sm text-gray-600 sm:text-xs">
                Grow
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="w-full truncate">
                  Build something you are proud of
                </span>
                <RiArrowRightUpLine className="size-4 shrink-0 text-gray-700" />
              </span>
            </div>
          </button>
        </FadeDiv>

        <h1 className="mt-8 text-center text-5xl font-semibold tracking-tighter text-gray-900 sm:text-8xl sm:leading-22">
          <FadeSpan>
            Build a{" "}
            <span className="font-redaction italic font-normal text-[#ED4D30] [font-synthesis:none] antialiased [text-rendering:optimizeLegibility]">
              Website
            </span>
          </FadeSpan>{" "}
          <FadeSpan>with High End UI</FadeSpan>
          <br />
          <FadeSpan>Components</FadeSpan>{" "}
          <FadeSpan>see how in this video</FadeSpan>
        </h1>

        <p className="mt-5 max-w-xl text-center text-base text-balance text-gray-700 sm:mt-8 sm:text-xl">
          <FadeSpan>Revolutionizing site and software builds with</FadeSpan>{" "}
          <FadeSpan>component libraries and frameworks</FadeSpan>{" "}
          <FadeSpan>
            to create beautiful, intuitive and functional websites and software.
          </FadeSpan>
        </p>

        <HeroVideoDialog
          className="mt-10 w-full max-w-3xl mx-auto"
          videoSrc="https://fast.wistia.net/embed/iframe/4hojzyo8f0?seo=false&videoFoam=true"
          thumbnailSrc="https://fast.wistia.com/embed/medias/4hojzyo8f0/swatch"
          thumbnailAlt="Building with Premium UI – Example"
          animationStyle="from-center"
        />

        <FadeDiv>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border-b-[1.5px] border-orange-700 bg-linear-to-b from-orange-400 to-orange-500 px-5 py-3 leading-4 font-medium tracking-wide whitespace-nowrap text-white shadow-[0_0_0_2px_rgba(0,0,0,0.04),0_0_14px_0_rgba(255,255,255,0.19)] transition-all duration-200 ease-in-out hover:shadow-orange-300"
          >
            Free Prototype + M.V.P Build
          </button>
        </FadeDiv>

        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <GameOfLife />
        </div>
      </FadeContainer>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType="prototype"
      />
    </section>
  );
}
