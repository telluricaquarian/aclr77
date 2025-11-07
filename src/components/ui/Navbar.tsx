"use client";

import { siteConfig } from "@/app/siteConfig";
import useScroll from "@/lib/useScroll";
import { cx } from "@/lib/utils";
import { RiCloseFill, RiMenuFill } from "@remixicon/react";
import Link from "next/link";
import React from "react";
import { SolarLogo } from "../../../public/SolarLogo";
import { Button } from "../Button";

export function NavBar() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(15);

  // ---- smooth scroll helper (keeps URL clean; no #hash) ----
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

    // remove any existing hash fragment to keep the address bar clean
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={cx(
        "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-6xl justify-center rounded-lg border border-transparent px-3 py-3 transition duration-300",
        scrolled || open
          ? "border-gray-200/50 bg-white/80 shadow-2xl shadow-black/5 backdrop-blur-sm"
          : "bg-white/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <span className="sr-only">Solar Tech Logo</span>
            <SolarLogo className="w-22" />
          </Link>

          {/* desktop nav */}
          <nav className="hidden sm:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-10 font-medium">
              <a
                href="#solutions"
                onClick={go("solutions")}
                className="px-2 py-1 text-gray-900"
              >
                High End UI
              </a>
              <a
                href="#farm-management"
                onClick={go("farm-management")}
                className="px-2 py-1 text-gray-900"
              >
                Media Buying
              </a>
              <a
                href="#solar-analytics"
                onClick={go("solar-analytics")}
                className="px-2 py-1 text-gray-900"
              >
                Funnel Optimization
              </a>
            </div>
          </nav>

          <Button
            variant="secondary"
            className="hidden h-10 font-semibold sm:block"
          >
            Get a quote
          </Button>

          {/* mobile toggle */}
          <Button
            onClick={() => setOpen(!open)}
            variant="secondary"
            className="p-1.5 sm:hidden"
            aria-label={open ? "Close Navigation Menu" : "Open Navigation Menu"}
          >
            {!open ? (
              <RiMenuFill className="size-6 shrink-0 text-gray-900" aria-hidden />
            ) : (
              <RiCloseFill className="size-6 shrink-0 text-gray-900" aria-hidden />
            )}
          </Button>
        </div>

        {/* mobile nav */}
        <nav
          className={cx(
            "mt-6 flex flex-col gap-6 text-lg transition-all duration-300 ease-in-out will-change-transform sm:hidden",
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
          )}
        >
          <ul className="space-y-4 font-medium">
            <li>
              <a href="#solutions" onClick={go("solutions")}>
                High End UI
              </a>
            </li>
            <li>
              <a href="#farm-management" onClick={go("farm-management")}>
                Media Buying
              </a>
            </li>
            <li>
              <a href="#solar-analytics" onClick={go("solar-analytics")}>
                Funnel Optimization
              </a>
            </li>
          </ul>
          <Button variant="secondary" className="text-lg">
            Get a quote
          </Button>
        </nav>
      </div>
    </header>
  );
}
