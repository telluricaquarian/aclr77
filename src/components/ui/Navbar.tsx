"use client";

import { siteConfig } from "@/app/siteConfig";
import QuoteModal from "@/components/ui/WaitlistModal";
import useScroll from "@/lib/useScroll";
import { cx } from "@/lib/utils";
import { RiCloseFill, RiMenuFill } from "@remixicon/react";
import Link from "next/link";
import React from "react";
import { SolarLogo } from "../../../public/SolarLogo";
import { Button } from "../Button";

export function NavBar() {
  const [open, setOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const scrolled = useScroll(15);

  // smooth scroll without leaving a #hash
  const scrollToId = React.useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-6xl justify-center rounded-lg border border-transparent px-3 py-2 sm:py-3 transition duration-300",
          scrolled || open
            ? "border-gray-200/50 bg-white/80 shadow-2xl shadow-black/5 backdrop-blur-sm"
            : "bg-white/0",
        )}
      >
        {/* relative parent for desktop centering; mobile overlay is fixed, not here */}
        <div className="relative w-full md:my-auto">
          <div className="relative flex items-center justify-between">
            {/* Logo: keep on mobile, hide on desktop */}
            <Link
              href={siteConfig.baseLinks.home}
              aria-label="Home"
              className="sm:hidden"
            >
              <span className="sr-only">Solar Tech Logo</span>
              <SolarLogo className="w-22" />
            </Link>

            {/* desktop nav */}
            <nav className="hidden sm:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
              <div className="flex items-center gap-10 font-medium">
                <a
                  href="#solutions"
                  onClick={go("solutions")}
                  className="px-2 py-1 text-gray-900 font-semibold"
                >
                  Web Design w/ High End UI
                </a>
                <a
                  href="#farm-management"
                  onClick={go("farm-management")}
                  className="px-2 py-1 text-gray-600 italic"
                >
                  Client Acquisition (by discretion)
                </a>
                <a
                  href="#solar-analytics"
                  onClick={go("solar-analytics")}
                  className="px-2 py-1 text-gray-600 italic"
                >
                  Funnel Optimization (by discretion)
                </a>
              </div>
            </nav>

            <Button
              variant="secondary"
              className="hidden h-10 font-semibold sm:block"
              onClick={() => setIsModalOpen(true)}
            >
              Get a quote
            </Button>

            {/* mobile toggle */}
            <Button
              onClick={() => setOpen((v) => !v)}
              variant="secondary"
              className="p-1.5 sm:hidden"
              aria-label={open ? "Close Navigation Menu" : "Open Navigation Menu"}
            >
              {open ? (
                <RiCloseFill className="size-6 shrink-0 text-gray-900" aria-hidden />
              ) : (
                <RiMenuFill className="size-6 shrink-0 text-gray-900" aria-hidden />
              )}
            </Button>
          </div>
        </div>

        {/* ===== Mobile overlay (fixed) ===== */}
        {/* Backdrop */}
        <div
          className={cx(
            "fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity sm:hidden",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setOpen(false)}
          aria-hidden={!open}
        />

        {/* Panel */}
        <nav
          className={cx(
            "fixed left-1/2 top-20 z-[70] w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:hidden",
            "transition-all duration-200 ease-out",
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none",
          )}
          aria-hidden={!open}
        >
          <div className="p-6">
            <ul className="space-y-5 font-medium">
              <li>
                <a href="#solutions" onClick={go("solutions")} className="block text-gray-900">
                  Web Design w/ High End UI
                </a>
              </li>
              <li>
                <a
                  href="#farm-management"
                  onClick={go("farm-management")}
                  className="block text-gray-700 italic"
                >
                  Client Acquisition (by discretion)
                </a>
              </li>
              <li>
                <a
                  href="#solar-analytics"
                  onClick={go("solar-analytics")}
                  className="block text-gray-700 italic"
                >
                  Funnel Optimization (by discretion)
                </a>
              </li>
            </ul>

            <Button
              variant="secondary"
              className="mt-6 w-full text-lg"
              onClick={() => {
                setOpen(false);
                setIsModalOpen(true);
              }}
            >
              Get a quote
            </Button>
          </div>
        </nav>
      </header>

      {/* Waitlist Modal */}
      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} modalType="quote" />
    </>
  );
}
