import {
  RiBookOpenFill,
  RiCircleLine,
  RiCodepenLine,
  RiContrast2Line,
  RiFullscreenFill,
  RiLoaderFill,
  RiNotification2Line,
  RiPlaneFill,
} from "@remixicon/react";
import Image from "next/image";

import { Orbit } from "../Orbit";
import ChipViz from "./ChipViz";

export default function Features() {
  return (
    <section
      aria-label="Solar Technologies Features for Farms"
      id="solutions"
      className="relative mx-auto max-w-6xl scroll-my-24"
    >
      {/* Vertical Lines */}
      <div className="pointer-events-none inset-0 select-none">
        {/* Left */}
        <div
          className="absolute inset-y-0 -my-20 w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-gray-300"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* Right */}
        <div
          className="absolute inset-y-0 right-0 -my-20 w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-gray-300"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* Middle */}
        <div
          className="absolute inset-y-0 left-1/2 -z-10 -my-20 w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-gray-300"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* 25% */}
        <div
          className="absolute inset-y-0 left-1/4 -z-10 -my-20 hidden w-px sm:block"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-gray-300"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* 75% */}
        <div
          className="absolute inset-y-0 left-3/4 -z-10 -my-20 hidden w-px sm:block"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-gray-300"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-0">
        {/* Content */}
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-lg font-semibold tracking-tight text-orange-500">
            The Workflow
            <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
            Quickly Iterate and Bring Projects to Life
          </p>
          <p className="mt-4 text-balance text-gray-700">
            Seamless and streamlined design and development process for your
            projects. No more delays, no more headaches. Designed by solo
            creative founder Llewellyn from Areculateir.
          </p>
        </div>

        {/* Orbit Visualization */}
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg className="absolute size-full mask-[linear-gradient(transparent,white_10rem)]">
            <defs>
              <pattern
                id="diagonal-feature-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8;
                  return (
                    <path
                      key={i}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-gray-200/70"
                      strokeWidth="1"
                    />
                  );
                })}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-feature-pattern)" />
          </svg>

          <div className="pointer-events-none h-104 p-10 select-none">
            <div className="relative flex flex-col items-center justify-center">
              <Orbit
                durationSeconds={40}
                radiusPx={140}
                keepUpright
                orbitingObjects={[
                  // UI Library
                  <div key="obj1" className="relative flex items-center justify-center">
                    <RiBookOpenFill className="z-10 size-5 text-gray-900" />
                    <div className="absolute size-10 rounded-full bg-white/50 ring-1 shadow-lg ring-black/5"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-red-500 p-1 text-xs ring-1 ring-gray-200">
                          <RiCircleLine className="size-3 shrink-0 text-white" />
                        </div>
                        <div className="rounded-r-full bg-white/50 py-0.5 pr-1.5 pl-1 text-xs whitespace-nowrap ring-1 ring-gray-200">
                          UI Library
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ animationDelay: "1s" }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-orange-500/50"
                    ></div>
                  </div>,

                  // Cursor
                  <div key="obj2" className="relative flex items-center justify-center">
                    <Image
                      src="/images/darkcursor.png"
                      alt="Cursor logo"
                      width={28}
                      height={28}
                      className="z-10 rounded-full object-contain"
                      unoptimized
                    />
                    <div className="absolute size-10 rounded-full bg-white/50 ring-1 shadow-lg ring-black/5"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-gray-500 p-1 text-xs ring-1 ring-gray-200">
                          <RiLoaderFill className="size-3 shrink-0 animate-spin text-white" />
                        </div>
                        <div className="rounded-r-full bg-white/50 py-0.5 pr-1.5 pl-1 text-xs ring-1 ring-gray-200">
                          Cursor
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ animationDelay: "4s" }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-orange-500/50"
                    ></div>
                  </div>,

                  // Vercel
                  <div key="obj3" className="relative flex items-center justify-center">
                    <Image
                      src="/images/vercellight.png"
                      alt="Vercel logo"
                      width={24}
                      height={24}
                      className="z-10 object-contain"
                      unoptimized
                    />
                    <div className="absolute size-10 rounded-full bg-white/50 ring-1 shadow-lg ring-black/5"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-gray-900 p-1 text-xs ring-1 ring-gray-200">
                          <svg
                            viewBox="0 0 1155 1000"
                            className="h-3 w-3 text-white"
                            aria-hidden="true"
                          >
                            <path d="M577.3 0L1154.6 1000H0L577.3 0z" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="rounded-r-full bg-white/50 py-0.5 pr-1.5 pl-1 text-xs ring-1 ring-gray-200">
                          Vercel
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ animationDelay: "2s" }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-orange-500/50"
                    ></div>
                  </div>,

                  // GitHub
                  <div key="obj4" className="relative flex items-center justify-center">
                    <Image
                      src="/images/githubdark.png"
                      alt="GitHub logo"
                      width={28}
                      height={28}
                      className="z-10 rounded-full object-contain"
                      unoptimized
                    />
                    <div className="absolute size-10 rounded-full bg-white/50 ring-1 shadow-lg ring-black/5"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-gray-900 p-1 text-xs ring-1 ring-gray-200">
                          <RiLoaderFill className="size-3 shrink-0 text-white" />
                        </div>
                        <div className="rounded-r-full bg-white/50 py-0.5 pr-1.5 pl-1 text-xs ring-1 ring-gray-200">
                          GitHub
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ animationDelay: "6s" }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-orange-500/50"
                    ></div>
                  </div>,

                  // Plane — with "Ship Fast"
                  <div key="obj5" className="relative flex items-center justify-center">
                    <RiPlaneFill className="z-10 size-5 rotate-90 text-gray-900" />
                    <div className="absolute size-10 rounded-full bg-white/50 ring-1 shadow-lg ring-black/5"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-sky-500 p-1 text-xs ring-1 ring-gray-200">
                          <RiPlaneFill className="size-3 shrink-0 -rotate-90 text-white" />
                        </div>
                        <div className="rounded-r-full bg-white/50 py-0.5 pr-1.5 pl-1 text-xs ring-1 ring-gray-200">
                          Ship Fast
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ animationDelay: "3s" }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-orange-500/50"
                    ></div>
                  </div>,
                ]}
              >
                <div className="relative flex h-48 w-48 items-center justify-center">
                  <div className="rounded-full p-1 ring-1 ring-black/10">
                    <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-white ring-1 shadow-[inset_0px_-15px_20px_rgba(0,0,0,0.1),0_7px_10px_0_rgba(0,0,0,0.15)] ring-black/20">
                      <Image
                        src="/images/middleaclr.png"
                        alt="Areculateir logo"
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                        priority
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-12 animate-[spin_8s_linear_infinite] rounded-full bg-linear-to-t from-transparent via-orange-400 to-transparent blur-lg" />
                  </div>
                </div>
              </Orbit>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-lg font-semibold tracking-tight text-orange-500">
            Building with UI Libraries
            <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
            Want something that visually communicates value?
          </p>
          <p className="mt-4 text-balance text-gray-700">
            Using components that look professional, sleek and appealing command
            not just attention but respect.
          </p>
        </div>

        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg className="absolute size-full">
            <defs>
              <pattern
                id="diagonal-feature-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8;
                  return (
                    <path
                      key={i}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-gray-200/70"
                      strokeWidth="1"
                    />
                  );
                })}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-feature-pattern)" />
          </svg>

          <div className="relative h-[432px] w-[432px]">
            {/* Grid */}
            <svg id="grid" xmlns="http://www.w3.org/2000/svg" fill="none" className="mask absolute size-[432px]">
              <path
                className="stroke-gray-300"
                d="M48 0v432M96 0v432M144 0v432M192 0v432M240 0v432M288 0v432M336 0v432M384 0v432M0 48h432M0 96h432M0 144h432M0 192h432M0 240h432M0 288h432M0 336h432M0 384h432"
              />
            </svg>

            <div className="pointer-events-none relative h-full select-none">
              {/* CENTER — Areculateir mark */}
              <div className="absolute top-[192px] left-[191.8px]">
                <div className="flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                  {/* CENTER — Areculateir mark */}
                  <Image
                    src="/images/middleaclr.png"
                    alt="Areculateir mark"
                    width={24}
                    height={24}
                    className="h-8 w-8 object-contain"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {/* 14°C → 21stdev.jpg */}
              <div className="absolute top-[0px] left-[48px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-orange-200 blur-[3px]" />
                  <div className="relative flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                    {/* 14°C → 21stdev.jpg */}
                    <Image
                      src="/images/21stdev.jpg"
                      alt="21stdev"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* 18°C → blockslogo.png */}
              <div className="absolute top-[48px] left-[144px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-orange-200 blur-[3px]" />
                  <div className="relative flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                    {/* 18°C → blockslogo.png */}
                    <Image
                      src="/images/blockslogo.png"
                      alt="Blocks"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* 17°C → elevenlabs.png */}
              <div className="absolute top-[96px] left-[240px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-orange-200 blur-[3px]" />
                  <div className="relative flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                    {/* 17°C → elevenlabs.png */}
                    <Image
                      src="/images/elevenlabs.png"
                      alt="ElevenLabs"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* (right) 14°C → kibo.svg */}
              <div className="absolute top-[240px] left-[385px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-orange-200 blur-[3px]" />
                  <div className="relative flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                    {/* (right) 14°C → kibo.svg */}
                    <Image
                      src="/images/kibo.svg"
                      alt="Kibo"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* 17°C (bottom-left) → magicui.png */}
              <div className="absolute top-[288px] left-[144px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-orange-200 blur-[3px]" />
                  <div className="relative flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                    {/* 17°C (bottom-left) → magicui.png */}
                    <Image
                      src="/images/magicui.png"
                      alt="Magic UI"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* 12°C → shadcn.png */}
              <div className="absolute top-[337px] left-[336px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-orange-200 blur-[3px]" />
                  <div className="relative flex h-12 w-12 items-center justify-center bg-white ring-1 shadow-sm ring-black/15">
                    {/* 12°C → shadcn.png */}
                    <Image
                      src="/images/shadcn.png"
                      alt="shadcn/ui"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-lg font-semibold tracking-tight text-orange-500">
            Cursor as “Mission control”
            <div className="absolute top-1 -left-[7px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
            Complete Contextual Visibility
          </p>
          <p className="mt-4 text-balance text-gray-700">
            Cursor provides developers full context of their code.
            Areculateir extends that same power to founders — transforming Cursor into a programmable interface that can run and automate their entire business stack.
          </p>
        </div>

        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg className="absolute size-full mask-[linear-gradient(white_10rem,transparent)]">
            <defs>
              <pattern
                id="diagonal-feature-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8;
                  return (
                    <path
                      key={i}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-gray-200/70"
                      strokeWidth="1"
                    />
                  );
                })}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-feature-pattern)" />
          </svg>

          <div className="pointer-events-none relative flex size-full h-104 items-center justify-center p-10 select-none">
            <div className="relative">
              <div className="absolute top-24 left-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-gray-50 p-1 ring-1 shadow-md shadow-black/10 ring-black/10">
                  <div className="w-fit rounded-full bg-linear-to-b from-white to-gray-100 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.09),0_3px_5px_0_rgba(0,0,0,0.19)] ring-white/50 ring-inset">
                    <RiNotification2Line className="size-5 text-gray-900" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="absolute top-24 right-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-gray-50 p-1 ring-1 shadow-md shadow-black/10 ring-black/10">
                  <div className="w-fit rounded-full bg-linear-to-b from-white to-gray-100 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-white/50 ring-inset">
                    <RiContrast2Line className="size-5 text-gray-900" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="absolute right-24 bottom-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-gray-50 p-1 ring-1 shadow-md shadow-black/10 ring-black/10">
                  <div className="w-fit rounded-full bg-linear-to-b from-white to-gray-100 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-white/50 ring-inset">
                    <RiCodepenLine className="size-5 text-gray-900" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-24 left-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-gray-50 p-1 ring-1 shadow-md shadow-black/10 ring-black/10">
                  <div className="w-fit rounded-full bg-linear-to-b from-white to-gray-100 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-white/50 ring-inset">
                    <RiFullscreenFill className="size-5 text-gray-900" aria-hidden />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {[0, 45, 135, 180, 225, 315, 360].map((rotation, index) => (
                <div
                  key={rotation}
                  className="absolute origin-left overflow-hidden"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="relative">
                    <div className="h-0.5 w-60 bg-linear-to-r from-gray-300 to-transparent" />
                    <div
                      className="absolute top-0 left-0 h-0.5 w-28 bg-linear-to-r from-transparent via-orange-300 to-transparent"
                      style={{
                        animation: `gridMovingLine 5s linear infinite ${index * 1.2}s`,
                        animationFillMode: "backwards",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <ChipViz />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
