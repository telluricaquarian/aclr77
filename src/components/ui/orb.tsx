"use client";

import * as React from "react";

export type AgentState = "listening" | "talking" | null;

type OrbProps = {
    colors?: [string, string];
    seed?: number;
    agentState?: AgentState;
    className?: string;
};

/**
 * Lightweight animated orb (no three.js). Uses canvas + requestAnimationFrame.
 * - "talking" => stronger motion
 * - "listening" => subtle motion
 * - null => very subtle idle motion
 */
export function Orb({
    colors = ["#CADCFC", "#A0B9D1"],
    seed = 1000,
    agentState = null,
    className,
}: OrbProps) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const rafRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Handle DPR scaling
        const resize = () => {
            const parent = canvas.parentElement;
            const w = parent?.clientWidth ?? 256;
            const h = parent?.clientHeight ?? 256;
            const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement ?? canvas);

        // Simple deterministic RNG based on seed
        let s = seed >>> 0;
        const rand = () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };

        const blobs = Array.from({ length: 7 }).map(() => ({
            a: 0.08 + rand() * 0.12,
            w: 0.7 + rand() * 1.4,
            p: rand() * Math.PI * 2,
            r: 0.35 + rand() * 0.55,
        }));

        const draw = (t: number) => {
            const parent = canvas.parentElement;
            const W = parent?.clientWidth ?? 256;
            const H = parent?.clientHeight ?? 256;

            ctx.clearRect(0, 0, W, H);

            // Motion intensity based on state
            const intensity =
                agentState === "talking" ? 1.35 : agentState === "listening" ? 0.85 : 0.55;

            const cx = W / 2;
            const cy = H / 2;
            const R = Math.min(W, H) * 0.42;

            // Base radial gradient
            const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.15, cx, cy, R);
            g.addColorStop(0, colors[0]);
            g.addColorStop(1, colors[1]);

            // Outer vignette
            const edge = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.05);
            edge.addColorStop(0, "rgba(0,0,0,0)");
            edge.addColorStop(1, "rgba(0,0,0,0.35)");

            // Build a wobbly orb path
            ctx.save();
            ctx.beginPath();

            const steps = 220;
            for (let i = 0; i <= steps; i++) {
                const a = (i / steps) * Math.PI * 2;
                let wobble = 0;

                for (const b of blobs) {
                    wobble += Math.sin(a * b.w + (t * 0.0012 * intensity) + b.p) * b.a;
                }

                // Slight breathing
                const breathe = Math.sin(t * 0.001 * intensity) * 0.02;

                const rr = R * (1 + wobble + breathe);
                const x = cx + Math.cos(a) * rr;
                const y = cy + Math.sin(a) * rr;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Fill orb
            ctx.fillStyle = g;
            ctx.fill();

            // Specular highlight
            ctx.globalCompositeOperation = "screen";
            const h1 = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.35, 0, cx - R * 0.25, cy - R * 0.35, R * 0.9);
            h1.addColorStop(0, "rgba(255,255,255,0.28)");
            h1.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = h1;
            ctx.fill();

            // Edge vignette
            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = edge;
            ctx.fill();

            // State ring
            ctx.globalCompositeOperation = "source-over";
            if (agentState === "talking") {
                ctx.strokeStyle = "rgba(255,255,255,0.22)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2);
                ctx.stroke();
            } else if (agentState === "listening") {
                ctx.strokeStyle = "rgba(255,255,255,0.14)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ro.disconnect();
        };
    }, [agentState, colors, seed]);

    return (
        <canvas
            ref={canvasRef}
            className={className ?? "h-full w-full"}
            aria-hidden="true"
        />
    );
}
