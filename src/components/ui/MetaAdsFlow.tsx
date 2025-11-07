"use client";

import { motion } from "framer-motion";
import type { SVGProps } from "react";

type Node = {
    id: string;
    label: string;
    x: number; // 0–100 (percent of viewBox width)
    y: number; // 0–100 (percent of viewBox height)
    note?: string;
};

type Edge = { from: string; to: string };

export type MetaAdsFlowProps = SVGProps<SVGSVGElement> & {
    width?: number;
    height?: number;
};

/**
 * Flow chart for Meta Ads structure:
 * Campaign -> Ad Sets -> Ads
 * Dark theme-friendly (uses Tailwind stroke/fill utilities).
 */
export default function MetaAdsFlow({
    width = 840,
    height = 360,
    ...props
}: MetaAdsFlowProps) {
    const nodes: Node[] = [
        { id: "campaign", label: "Campaign\n(Objective • Budget)", x: 50, y: 14 },

        {
            id: "adset1",
            label: "Ad Set • Prospecting\n(Audience • Placements • Bid)",
            x: 25,
            y: 42,
        },
        {
            id: "adset2",
            label: "Ad Set • Retargeting\n(7–30d engagers • Placements)",
            x: 75,
            y: 42,
        },

        { id: "ad1a", label: "Ad A\n(UGC Hook 1)", x: 10, y: 74 },
        { id: "ad1b", label: "Ad B\n(Static • H1 Test)", x: 28, y: 74 },

        { id: "ad2a", label: "Ad C\n(Video • 15s)", x: 62, y: 74 },
        { id: "ad2b", label: "Ad D\n(Carousel)", x: 80, y: 74 },
    ];

    const edges: Edge[] = [
        { from: "campaign", to: "adset1" },
        { from: "campaign", to: "adset2" },
        { from: "adset1", to: "ad1a" },
        { from: "adset1", to: "ad1b" },
        { from: "adset2", to: "ad2a" },
        { from: "adset2", to: "ad2b" },
    ];

    // Helper to find a node by id
    const N = (id: string) => nodes.find((n) => n.id === id)!;

    // Box metrics
    const box = { w: 240, h: 72, rx: 14 };

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            role="img"
            aria-label="Meta Ads Campaign Structure: Campaign to Ad Sets to Ads"
            className="max-w-full drop-shadow-sm"
            {...props}
        >
            {/* defs: arrowheads & subtle glow */}
            <defs>
                <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                >
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

            {/* background grid (very subtle) */}
            <g opacity="0.25">
                {[...Array(14)].map((_, i) => (
                    <line
                        key={`v${i}`}
                        x1={(i + 1) * (width / 15)}
                        x2={(i + 1) * (width / 15)}
                        y1={0}
                        y2={height}
                        className="stroke-zinc-900"
                        strokeWidth={1}
                    />
                ))}
                {[...Array(6)].map((_, i) => (
                    <line
                        key={`h${i}`}
                        x1={0}
                        x2={width}
                        y1={(i + 1) * (height / 7)}
                        y2={(i + 1) * (height / 7)}
                        className="stroke-zinc-900"
                        strokeWidth={1}
                    />
                ))}
            </g>

            {/* edges (animated dashed flow) */}
            <g className="stroke-zinc-700">
                {edges.map((e, idx) => {
                    const a = N(e.from);
                    const b = N(e.to);
                    const ax = (a.x / 100) * width;
                    const ay = (a.y / 100) * height + box.h / 2;
                    const bx = (b.x / 100) * width;
                    const by = (b.y / 100) * height - box.h / 2;

                    // curved connector
                    const mx = (ax + bx) / 2;
                    const path = `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;

                    return (
                        <motion.path
                            key={idx}
                            d={path}
                            fill="none"
                            strokeWidth={2}
                            strokeDasharray="8 6"
                            strokeDashoffset={0}
                            markerEnd="url(#arrow)"
                            className="stroke-orange-500/70"
                            animate={{ strokeDashoffset: [0, -40] }}
                            transition={{
                                duration: 2,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                            filter="url(#soft-glow)"
                        />
                    );
                })}
            </g>

            {/* nodes */}
            {nodes.map((n) => {
                const x = (n.x / 100) * width - box.w / 2;
                const y = (n.y / 100) * height - box.h / 2;

                const isTop = n.id === "campaign";
                const isAdSet = n.id.startsWith("adset");

                return (
                    <g key={n.id} transform={`translate(${x}, ${y})`} filter="url(#soft-glow)">
                        {/* pulsing halo for key tiers */}
                        {(isTop || isAdSet) && (
                            <motion.rect
                                initial={{ opacity: 0.0, scale: 1 }}
                                animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.03, 1] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                                width={box.w}
                                height={box.h}
                                rx={box.rx}
                                className="fill-zinc-900"
                            />
                        )}

                        <rect
                            width={box.w}
                            height={box.h}
                            rx={box.rx}
                            className={
                                isTop
                                    ? "fill-zinc-900 stroke-orange-500/70"
                                    : isAdSet
                                        ? "fill-zinc-900 stroke-zinc-700"
                                        : "fill-zinc-900 stroke-zinc-800"
                            }
                            strokeWidth={2}
                        />

                        <text
                            x={box.w / 2}
                            y={box.h / 2}
                            dominantBaseline="middle"
                            textAnchor="middle"
                            className={isTop ? "fill-white font-semibold" : "fill-zinc-200"}
                            style={{ whiteSpace: "pre-line" }}
                        >
                            {n.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
