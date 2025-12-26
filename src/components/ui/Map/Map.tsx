export const Map = () => {
  return (
    <section
      id="farm-management"
      aria-labelledby="management-title"
      className="relative flex w-full max-w-7xl scroll-my-24 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gray-950 px-10 shadow-2xl shadow-black/50 sm:px-16 md:px-28 lg:mx-auto"
    >
      {/* left decorative rail */}
      <div className="absolute left-0 z-10 h-full backdrop-blur-[2px]">
        <svg
          className="h-full w-8 border-r border-zinc-900 stroke-zinc-800 sm:w-20"
          style={{
            maskImage:
              "linear-gradient(transparent, white 10rem, white calc(100% - 10rem), transparent)",
          }}
        >
          <defs>
            <pattern
              id="diagonal-border-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    stroke=""
                    strokeWidth="1"
                  />
                )
              })}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-border-pattern)" />
        </svg>
      </div>

      {/* right decorative rail */}
      <div className="absolute right-0 z-10 h-full backdrop-blur-[2px]">
        <svg
          className="h-full w-8 border-r border-zinc-900 stroke-zinc-800 sm:w-20"
          style={{
            maskImage:
              "linear-gradient(transparent, white 10rem, white calc(100% - 10rem), transparent)",
          }}
        >
          <defs>
            <pattern
              id="diagonal-border-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    stroke=""
                    strokeWidth="1"
                  />
                )
              })}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-border-pattern)" />
        </svg>
      </div>

      {/* Section label */}
      <div className="pt-12 text-base font-semibold tracking-tight text-orange-400 sm:pt-20 sm:text-lg">
        Customer Acquisition
      </div>

      {/* Heading */}
      <h2
        id="management-title"
        className="mt-6 max-w-[800px] text-center text-2xl font-semibold tracking-tight text-balance text-white md:text-5xl"
      >
        Systems for predictable growth, not guesswork
      </h2>

      {/* Description */}
      <p className="mt-4 max-w-3xl text-center text-base text-balance text-gray-400 sm:mt-8 sm:text-xl">
        Acquisition is treated as a system — not a channel. Strategy, creative, distribution,
        and conversion are designed together to surface signal early and scale what works.
      </p>

      {/* Content grid */}
      <div className="relative mt-20 mb-10 grid w-full max-w-[940px] grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white">1) Market &amp; Offer Clarity</p>
          <p className="mt-2 text-sm text-white/70">
            Identify demand, sharpen positioning, and define a single conversion objective.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white">2) Creative Systems</p>
          <p className="mt-2 text-sm text-white/70">
            Iterative creative batches built to discover hooks, angles, and winning narratives.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white">3) Funnel Design</p>
          <p className="mt-2 text-sm text-white/70">
            Minimal friction paths that align intent with the next logical action.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white">4) Validation → Scale</p>
          <p className="mt-2 text-sm text-white/70">
            Controlled spend to validate, then scale with economics and signal intact.
          </p>
        </div>
      </div>
    </section>
  )
}
