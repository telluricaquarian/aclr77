"use client";

import QuoteModal from "@/components/ui/WaitlistModal";
import useScroll from "@/lib/useScroll";
import { cx } from "@/lib/utils";
import { RiCloseFill, RiMenuFill } from "@remixicon/react";
import React from "react";
import { Button } from "../Button";

export function NavBar() {
  const [open, setOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const scrolled = useScroll(15);

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
            : "bg-white/0"
        )}
      >
        <div className="relative w-full">
          <div className="relative flex items-center justify-between">
            {/* 
              Desktop LEFT placeholder
              (keeps layout stable after removing logo)
            */}
            <div className="hidden sm:block w-[88px]" />

            {/* Desktop nav (centered) */}
            <nav className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-10 font-medium">
                <a
                  href="#solutions"
                  onClick={go("solutions")}
                  className="px-2 py-1 font-semibold text-gray-900"
                >
                  Web Design w/ High End UI
                </a>
                <a
                  href="#farm-management"
                  onClick={go("farm-management")}
                  className="px-2 py-1 italic text-gray-600"
                >
                  Client Acquisition (by discretion)
                </a>
                <a
                  href="#solar-analytics"
                  onClick={go("solar-analytics")}
                  className="px-2 py-1 italic text-gray-600"
                >
                  Funnel Optimization (by discretion)
                </a>
              </div>
            </nav>

            {/* Desktop CTA — unchanged, stays right */}
            <Button
              variant="secondary"
              className="hidden h-10 font-semibold sm:block"
              onClick={() => setIsModalOpen(true)}
            >
              Get a quote
            </Button>

            {/* Mobile menu toggle */}
            <Button
              onClick={() => setOpen((v) => !v)}
              variant="secondary"
              className="p-1.5 sm:hidden"
              aria-label={open ? "Close Navigation Menu" : "Open Navigation Menu"}
            >
              {open ? (
                <RiCloseFill className="size-6 text-gray-900" />
              ) : (
                <RiMenuFill className="size-6 text-gray-900" />
              )}
            </Button>
          </div>
        </div>

        {/* ===== Mobile overlay ===== */}
        <div
          className={cx(
            "fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity sm:hidden",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setOpen(false)}
        />

        {/* ===== Mobile panel ===== */}
        <nav
          className={cx(
            "fixed left-1/2 top-20 z-[70] w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:hidden transition-all duration-200",
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
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
                  className="block italic text-gray-700"
                >
                  Client Acquisition (by discretion)
                </a>
              </li>
              <li>
                <a
                  href="#solar-analytics"
                  onClick={go("solar-analytics")}
                  className="block italic text-gray-700"
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

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType="quote"
      />
    </>
  );
}
