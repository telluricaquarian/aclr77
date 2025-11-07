"use client";

import { motion } from "framer-motion";
import type { SVGProps } from "react";
import { useEffect, useState } from "react";

type Node = {
    id: string;
    label: string;
    x: number; // % of viewBox width
    y: number; // % of viewBox height
    w?: number;
    h?: number;
};
type Edge = { from: string; to: string };

export type MetaAdsFlowProps = SVGProps<SVGSVGElement> & {
    forceMobile?: boolean;
};

export default function MetaAdsFlow({
    className,
    forceMobile,
    ...props
}: MetaAdsFlowProps) {
    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection (legacy-safe)
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (typeof forceMobile === "boolean") {
            setIsMobile(forceMobile);
            return;
        }

        const mq = window.matchMedia("(max-width: 640px)");
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);

        // init + subscribe (modern)
        handleChange(mq);
        if (typeof mq.addEventListener === "function") {
            mq.addEventListener("change", handleChange);
            return () => mq.removeEventListener("change", handleChange);
        }

        // legacy
        interface LegacyMQ extends MediaQueryList {
            addListener(cb: (e: MediaQueryListEvent) => void): void;
            removeListener(cb: (e: MediaQueryListEvent) => void): void;
        }
        if ("addListener" in mq && "removeListener" in mq) {
            (mq as LegacyMQ).addListener(handleChange as (e: MediaQueryListEvent) => void);
            return () => (mq as LegacyMQ).removeListener(handleChange as (e: MediaQueryListEvent) => void);
        }
    }, [forceMobile]);

    // Desktop gets a bit wider viewBox for breathing room
    const VBW = isMobile ? 1000 : 1200;
    const VBH = 600;

    // Base sizes
    const desktopBox = { w: 300, h: 90 };
    const baseBox = isMobile ? { w: 260, h: 86 } : desktopBox;

    // ------- DESKTOP LAYOUT (short labels) -------
    const desktopNodes: Node[] = [
        { id: "campaign", label: "Campaign", x: 50, y: 16, w: 320, h: 100 },

        { id: "adset1", label: "Ad Set — Configurations", x: 30, y: 44, w: 340, h: 92 },
        { id: "adset2", label: "Ad Set — Configurations", x: 70, y: 44, w: 340, h: 92 },

        { id: "ad1a", label: "Ad / Creative / Media", x: 18, y: 78, w: 300, h: 86 },
        { id: "ad1b", label: "Ad / Creative / Media", x: 42, y: 78, w: 300, h: 86 },

        { id: "ad2a", label: "Ad / Creative / Media", x: 58, y: 78, w: 300, h: 86 },
        { id: "ad2b", label: "Ad / Creative / Media", x: 82, y: 78, w: 300, h: 86 },
    ];

    const desktopEdges: Edge[] = [
        { from: "campaign", to: "adset1" },
        { from: "campaign", to: "adset2" },
        { from: "adset1", to: "ad1a" },
        { from: "adset1", to: "ad1b" },
        { from: "adset2", to: "ad2a" },
        { from: "adset2", to: "ad2b" },
    ];

    // ------- MOBILE LAYOUT (stacked) -------
    const mobileNodes: Node[] = [
        { id: "campaign", label: "Campaign", x: 50, y: 10, w: 340, h: 96 },

        { id: "adset1", label: "Ad Set — Configurations", x: 50, y: 32, w: 360, h: 96 },
        { id: "adset2", label: "Ad Set — Configurations", x: 50, y: 54, w: 360, h: 96 },

        { id: "ad1a", label: "Ad / Creative / Media", x: 30, y: 76, w: 280, h: 86 },
        { id: "ad1b", label: "Ad / Creative / Media", x: 70, y: 76, w: 280, h: 86 },

        { id: "ad2a", label: "Ad / Creative / Media", x: 30, y: 92, w: 280, h: 86 },
        { id: "ad2b", label: "Ad / Creative / Media", x: 70, y: 92, w: 280, h: 86 },
    ];

    const mobileEdges: Edge[] = [
        { from: "campaign", to: "adset1" },
        { from: "adset1", to: "ad1a" },
        { from: "adset1", to: "ad1b" },
        { from: "campaign", to: "adset2" },
        { from: "adset2", to: "ad2a" },
        { from: "adset2", to: "ad2b" },
    ];

    const nodes = isMobile ? mobileNodes : desktopNodes;
    const edges = isMobile ? mobileEdges : desktopEdges;

    const N = (id: string) => nodes.find((n) => n.id === id)!;

    return (
        <svg
            viewBox={`0 0 ${VBW} ${VBH}`}
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Meta Ads Campaign Structure"
            className={["block max-w-full drop-shadow-sm", className].filter(Boolean).join(" ")}
            {...props}
        >
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-orange-400" />
                </marker>
                <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* subtle grid */}
            <g opacity="0.22">
                {[...Array(12)].map((_, i) => (
                    <line
                        key={`v${i}`}
                        x1={(i + 1) * (VBW / 13)}
                        x2={(i + 1) * (VBW / 13)}
                        y1={0}
                        y2={VBH}
                        className="stroke-zinc-900"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
                {[...Array(6)].map((_, i) => (
                    <line
                        key={`h${i}`}
                        x1={0}
                        x2={VBW}
                        y1={(i + 1) * (VBH / 7)}
                        y2={(i + 1) * (VBH / 7)}
                        className="stroke-zinc-900"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </g>

            {/* animated edges */}
            <g className="stroke-zinc-700">
                {edges.map((e, idx) => {
                    const a = N(e.from);
                    const b = N(e.to);

                    const ah = a.h ?? baseBox.h;
                    const bh = b.h ?? baseBox.h;

                    const ax = (a.x / 100) * VBW;
                    const ay = (a.y / 100) * VBH + ah / 2;
                    const bx = (b.x / 100) * VBW;
                    const by = (b.y / 100) * VBH - bh / 2;
                    const mx = (ax + bx) / 2;

                    return (
                        <motion.path
                            key={idx}
                            d={`M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`}
                            fill="none"
                            strokeWidth={2}
                            strokeDasharray="10 7"
                            strokeDashoffset={0}
                            markerEnd="url(#arrow)"
                            className="stroke-orange-500/70"
                            animate={{ strokeDashoffset: [0, -60] }}
                            transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
                            filter="url(#soft-glow)"
                            vectorEffect="non-scaling-stroke"
                        />
                    );
                })}
            </g>

            {/* nodes */}
            {nodes.map((n) => {
                const w = n.w ?? baseBox.w;
                const h = n.h ?? baseBox.h;
                const x = (n.x / 100) * VBW - w / 2;
                const y = (n.y / 100) * VBH - h / 2;

                const isTop = n.id === "campaign";
                const isAdSet = n.id.startsWith("adset");
                const fs = isMobile
                    ? (isTop ? 24 : isAdSet ? 18 : 16)
                    : (isTop ? 26 : isAdSet ? 18 : 16);

                return (
                    <g key={n.id} transform={`translate(${x}, ${y})`} filter="url(#soft-glow)">
                        {(isTop || isAdSet) && (
                            <motion.rect
                                initial={{ opacity: 0.0, scale: 1 }}
                                animate={{ opacity: [0.12, 0.3, 0.12], scale: [1, 1.03, 1] }}
                                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                                width={w}
                                height={h}
                                rx={16}
                                className="fill-zinc-900"
                            />
                        )}

                        <rect
                            width={w}
                            height={h}
                            rx={16}
                            className={
                                isTop
                                    ? "fill-zinc-900 stroke-orange-500/70"
                                    : isAdSet
                                        ? "fill-zinc-900 stroke-zinc-700"
                                        : "fill-zinc-900 stroke-zinc-800"
                            }
                            strokeWidth={2}
                            vectorEffect="non-scaling-stroke"
                        />

                        <text
                            x={w / 2}
                            y={h / 2}
                            dominantBaseline="middle"
                            textAnchor="middle"
                            className={isTop ? "fill-white font-semibold" : "fill-zinc-200"}
                            style={{ whiteSpace: "pre-line", fontSize: fs }}
                        >
                            {n.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
