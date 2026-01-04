/* eslint-disable @next/next/no-img-element */
"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { Play, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type FormEvent } from "react";

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
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
};

function safeTrim(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc = "/images/aclr77thumb.png",
  thumbnailAlt = "Video thumbnail",
  className = "",
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>(""); // success message
  const [errorMsg, setErrorMsg] = useState<string>(""); // error message

  const selectedAnimation = animationVariants[animationStyle];

  const canSubmit = useMemo(() => {
    const n = safeTrim(firstName);
    const e = safeTrim(email);
    return n.length > 0 && e.length > 3 && e.includes("@");
  }, [firstName, email]);

  const closeModal = () => {
    setIsVideoOpen(false);
    setIsSubmitting(false);
    setErrorMsg("");
    setStatusMsg("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg("");
    setStatusMsg("");

    const name = safeTrim(firstName);
    const emailTrimmed = safeTrim(email);

    if (!name || !emailTrimmed) {
      setErrorMsg("Please enter your name and email.");
      return;
    }

    // basic email sanity check (not strict, just enough)
    if (!emailTrimmed.includes("@") || !emailTrimmed.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: emailTrimmed,
          role: "",
          companySize: "",
          message: "",
          source: "video-modal",
        }),
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        console.error("Waitlist error:", txt);
        setErrorMsg("Something went wrong. Please try again.");
        return;
      }

      // Success UX
      setStatusMsg("You're on the waitlist — check your inbox.");
      setFirstName("");
      setEmail("");

      // close shortly after to feel polished
      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err) {
      console.error("Waitlist error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeModal();
            }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 w-full max-w-4xl md:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                type="button"
                onClick={closeModal}
                className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
                aria-label="Close video modal"
              >
                <XIcon className="size-5" />
              </motion.button>

              <div className="space-y-6">
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

                {/* Waitlist form */}
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="video-waitlist-name"
                      className="text-xs font-medium text-white/80"
                    >
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="video-waitlist-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your name"
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="video-waitlist-email"
                      className="text-xs font-medium text-white/80"
                    >
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="video-waitlist-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  {/* Inline feedback (no alerts) */}
                  {errorMsg ? (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errorMsg}
                    </div>
                  ) : null}

                  {statusMsg ? (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                      {statusMsg}
                    </div>
                  ) : null}

                  <div className="pt-2 flex justify-center">
                    <RainbowButton
                      type="submit"
                      className="px-8 py-3 text-base font-semibold"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? "Joining..." : "Join Waitlist"}
                    </RainbowButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
