import MetaAdsFlow from "../MetaAdsFlow"; // ✅ new import

export const Map = () => {
  return (
    <section
      id="farm-management"
      aria-labelledby="management-title"
      className="relative flex w-full max-w-6xl scroll-my-24 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gray-950 px-10 shadow-2xl shadow-black/50 sm:px-16 md:px-28 lg:mx-auto"
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
            <pattern id="diagonal-border-pattern" patternUnits="userSpaceOnUse" width="64" height="64">
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return <path key={i} d={`M${-106 + offset} 110L${22 + offset} -18`} stroke="" strokeWidth="1" />
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
            <pattern id="diagonal-border-pattern" patternUnits="userSpaceOnUse" width="64" height="64">
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return <path key={i} d={`M${-106 + offset} 110L${22 + offset} -18`} stroke="" strokeWidth="1" />
              })}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-border-pattern)" />
        </svg>
      </div>

      <div className="pt-12 text-base font-semibold tracking-tight text-orange-400 sm:pt-20 sm:text-lg">
        Media Buying
      </div>

      <h2
        id="management-title"
        className="mt-6 max-w-[700px] text-center text-2xl font-semibold tracking-tight text-balance text-white md:text-5xl"
      >
        Post Andromeda Meta, i.e Facebook & Instagram Ads
      </h2>

      <p className="mt-4 max-w-2xl text-center text-base text-balance text-gray-400 sm:mt-8 sm:text-xl">
        Creative Strategy & Creative Direction in relation to meta ads is what will be provided as a part of this
        discretionary service. This will include the following:
        <br />
        <br />- Templates of ad formats that are being shown to statistically work.
        <br />- Initial Campaign Setup and Running of first campaign.
      </p>

      {/* === NEW: Meta Ads flow chart === */}
      <div className="relative mt-20 mb-10 scale-90 sm:mb-16 md:mt-24 md:scale-100">
        <MetaAdsFlow className="mx-auto w-full md:w-[840px]" />
        <p className="mt-4 text-center text-xs text-zinc-400">
          Campaign → Ad Sets → Ads. Example labels shown for structure only.
        </p>
      </div>
    </section>
  )
}
