import {
  RiDropFill,
  RiNavigationFill,
  RiPieChartFill,
  RiRobot3Fill,
} from "@remixicon/react";
import { Divider } from "../Divider";
import AnalyticsIllustration from "./AnalyticsIllustration";
import { StickerCard } from "./StickerCard";

export function SolarAnalytics() {
  return (
    <section
      id="solar-analytics"
      aria-labelledby="solar-analytics"
      className="relative mx-auto w-full max-w-6xl overflow-hidden"
    >
      <div>
        <h2
          id="solar-analytics"
          className="relative scroll-my-24 text-lg font-semibold tracking-tight text-orange-500"
        >
          Funnel Optimization
          <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
        </h2>

        <p className="mt-2 max-w-lg text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
          Iteration and Strategic Tweaking of Your Funnel
        </p>
        <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">
          Conversion Rate Optimization applied to your full system — site,
          landing pages, and media. We iterate design, copy, offer flow, and
          sequencing to remove friction and guide the right visitors to the next
          step.
        </p>
      </div>

      {/* Illustration stays decorative and non-interactive */}
      <div className="*:pointer-events-none">
        <AnalyticsIllustration />
      </div>

      <Divider className="mt-0" />

      {/* 4 cards: Overview + ToFu + MoFu + BoFu */}
      <div className="grid grid-cols-1 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
        <StickerCard
          Icon={RiPieChartFill}
          title="What is Funnel Optimization"
          description="CRO across your whole journey. Rapid tests to refine messaging, UI/UX, and offer flow so more qualified users convert with less friction."
        />
        <StickerCard
          Icon={RiNavigationFill}
          title="Top of Funnel (ToFu)"
          description="Awareness & qualification. Hooks, creative, and angles that stop scrolls, build relevance, and pre-frame the value your audience cares about."
        />
        <StickerCard
          Icon={RiRobot3Fill}
          title="Middle of Funnel (MoFu)"
          description="Consideration & proof. UGC, testimonials, comparisons, and retargeting that answer objections and move curiosity toward intent."
        />
        <StickerCard
          Icon={RiDropFill}
          title="Bottom of Funnel (BoFu)"
          description="Conversion & AOV. Landing/checkout UX that reduces friction, adds urgency, and increases average order value with smart bundling and offers."
        />
      </div>
    </section>
  );
}
