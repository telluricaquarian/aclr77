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
          Agentic Workflows
          <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
        </h2>

        <p className="mt-2 max-w-lg text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
          Autonomous Systems That Operate Your Funnel
        </p>

        <p className="mt-3 max-w-2xl text-base text-gray-600 md:text-lg">
          We design agentic workflows that observe behavior, make decisions, and
          take action across your acquisition and conversion stack. These
          systems route intent, trigger follow-ups, generate assets, and adapt
          flows in real time — reducing manual overhead while increasing speed,
          consistency, and conversion velocity.
        </p>
      </div>

      {/* Illustration stays decorative and non-interactive */}
      <div className="*:pointer-events-none">
        <AnalyticsIllustration />
      </div>

      <Divider className="mt-0" />

      {/* 4 cards: Overview + System Layers */}
      <div className="grid grid-cols-1 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
        <StickerCard
          Icon={RiPieChartFill}
          title="What Are Agentic Workflows"
          description="Autonomous systems that continuously observe signals, make decisions, and execute actions across your funnel — replacing manual processes with compounding operational leverage."
        />
        <StickerCard
          Icon={RiNavigationFill}
          title="Top of System"
          description="Intent detection and qualification. Agents analyze behavior, route attention, and pre-frame value before a human ever intervenes."
        />
        <StickerCard
          Icon={RiRobot3Fill}
          title="Middle of System"
          description="Dynamic nurturing and objection handling. Proof, messaging, and follow-ups adapt automatically based on user signals and engagement."
        />
        <StickerCard
          Icon={RiDropFill}
          title="Bottom of System"
          description="Automated conversion and handoff. Scheduling, proposals, onboarding, and next steps executed with minimal friction and zero delays."
        />
      </div>
    </section>
  );
}
