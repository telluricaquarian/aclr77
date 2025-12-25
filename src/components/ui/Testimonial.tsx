export default function Testimonial() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl shadow-[#366A79]/70">

      {/* Background Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          src="/images/aclrvideo.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Subtle darkening for legibility */}
      <div className="absolute inset-0 -z-0 bg-black/45" />

      {/* Helmet Image (kept behind pill on mobile) */}
      <div className="pointer-events-none absolute -right-10 top-36 z-10 w-60 sm:top-40 sm:right-0 sm:w-80 md:top-44 md:right-2 md:w-[26rem] lg:top-52 lg:right-10 lg:w-[34rem]">
        <img
          alt="ACLR helmet"
          src="/images/orangehelmet.png"
          width={1080}
          height={1080}
          className="animate-hover w-full h-auto object-contain opacity-90"
        />
      </div>

      {/* Text Content */}
      <div className="relative z-20 px-8 pb-28 pt-10 sm:px-14 sm:pb-28 sm:pt-14 lg:px-24 lg:pb-32 lg:pt-20">
        <blockquote className="relative max-w-2xl text-xl leading-relaxed tracking-tight text-white md:text-2xl lg:text-3xl">
          <p className="before:absolute before:top-0 before:right-full before:content-['“'] after:text-white after:content-['”']">
            <strong className="font-semibold">
              Areculateir is founded and built by Llewellyn..
            </strong>{" "}
            <span className="text-white/90">
              The central service offering is high end UI element website / project
              builds. With discretionary media buying and funnel optimisation
              services, offered, as indicated, to the discretion of Llewellyn, owner
              of Areculateir
            </span>
          </p>
        </blockquote>
      </div>

      {/* Profile Pill (anchored, never collides) */}
      <div className="absolute bottom-5 left-5 right-5 z-30 sm:bottom-6 sm:left-10 sm:right-auto">
        <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-2xl ring-1 ring-black/10 backdrop-blur-md sm:w-[26rem]">
          <div className="relative shrink-0">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-black/10">
              <img
                alt="Areculateir helmet"
                src="/images/llewellyn.png"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-black">
              Llewellyn Y. Fisher
            </div>
            <div className="truncate text-xs text-black/70">
              Owner of Areculateir | Foresight into Reality | Made with Areculateirium⁷⁷
            </div>
          </div>
        </div>

        {/* Optional glow like your mock (comment out if you want it subtler) */}
        <div className="pointer-events-none absolute -inset-2 -z-10 rounded-[1.25rem] bg-orange-500/25 blur-xl" />
      </div>
    </section>
  )
}
