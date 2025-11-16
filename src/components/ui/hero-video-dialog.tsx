/* eslint-disable @next/next/no-img-element */
"use client";

import { Play, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ⭐ Add RainbowButton import
import { RainbowButton } from "@/components/ui/rainbow-button";

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out";

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  /** Prefer a local asset like /images/herothumb.png */
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  className?: string;
}

const animationVariants = {
  "from-bottom": { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
  "from-center": { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.5, opacity: 0 } },
  "from-top": { initial: { y: "-100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "-100%", opacity: 0 } },
  "from-left": { initial: { x: "-100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "-100%", opacity: 0 } },
  "from-right": { initial: { x: "100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  "top-in-bottom-out": { initial: { y: "-100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
  "left-in-right-out": { initial: { x: "-100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
};

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc = "/images/aclr77thumb.png",
  thumbnailAlt = "Video thumbnail",
  className = "",
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const selectedAnimation = animationVariants[animationStyle];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Thumbnail trigger */}
      <button
        type="button"
        aria-label="Play video"
        onClick={() => setIsVideoOpen(true)}
        className="group relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border bg-transparent p-0 shadow-lg"
      >
        <div className="relative aspect-video w-full">
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-28 items-center justify-center rounded-full bg-black/10 backdrop-blur-md">
              <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-white/90 to-white shadow-md transition-transform duration-200 ease-out group-hover:scale-110">
                <Play
                  className="size-8 text-black"
                  style={{
                    filter:
                      "drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ")
                setIsVideoOpen(false);
            }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 w-full max-w-4xl md:mx-0"
              onClick={(e) => e.stopPropagation()} // prevent modal click from closing
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
              >
                <XIcon className="size-5" />
              </motion.button>

              {/* Video Frame */}
              <div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-white">
                <iframe
                  src={videoSrc}
                  title="Hero Video player"
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>

              {/* ⭐ RainbowButton Positioned Under Video */}
              <div className="mt-6 flex justify-center">
                <RainbowButton className="px-8 py-3 text-base font-semibold">
                  Join Waitlist
                </RainbowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
