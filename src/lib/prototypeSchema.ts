import { z } from "zod";

export const PrototypeResultSchema = z.object({
    headline: z.string(),
    theme: z.object({
        palette: z.array(z.string()),
        typography: z.string(),
        vibe: z.string(),
    }),
    sitemap: z.array(z.string()),
    sections: z.array(z.string()),
    pages: z.array(
        z.object({
            route: z.string(),
            purpose: z.string(),
            components: z.array(z.string()),
        })
    ),
    quote: z.object({
        rangeAUD: z.object({ low: z.number(), high: z.number() }),
        timelineWeeks: z.object({ low: z.number(), high: z.number() }),
        assumptions: z.array(z.string()),
    }),
    copy: z.object({
        heroHeadline: z.string(),
        heroSubheadline: z.string(),
        primaryCta: z.string(),
        secondaryCta: z.string(),
    }),
});

export type PrototypeResult = z.infer<typeof PrototypeResultSchema>;
