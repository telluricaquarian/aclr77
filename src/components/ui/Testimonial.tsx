export default function Testimonial() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl shadow-[#366A79]/70">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          src="/images/aclrvideo.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Dark overlay so white text always stays readable */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Helmet Image */}
      <div className="absolute top-76 -right-14 z-20 w-76 sm:top-48 sm:right-3 sm:w-92 md:top-48 md:right-0 md:w-100 lg:top-64 lg:right-12 lg:w-136">
        <img
          alt="ACLR helmet"
          src="/images/orangehelmet.png"
          width={1080}
          height={1080}
          className="h-auto w-full animate-hover object-contain"
        />
      </div>

      {/* Text Content */}
      <div className="relative z-10 mb-20 p-8 sm:p-14 lg:p-24">
        <div>
          <blockquote className="relative max-w-2xl text-xl leading-relaxed tracking-tight text-white md:text-2xl lg:text-3xl">
            <p className="before:absolute before:top-0 before:right-full before:content-['“'] after:content-['”']">
              <strong className="font-semibold">
                Areculateir is founded and built by Llewellyn..
              </strong>{" "}
              <span className="text-white/90">
                The central service offering is high end UI element website /
                project builds. With discretionary media buying and funnel
                optimisation services, offered, as indicated, to the discretion of
                Llewellyn, owner of Areculateir
              </span>
            </p>
          </blockquote>
        </div>

        {/* Profile Section */}
        <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0 rounded-full bg-white/15 p-0.5 ring-1 ring-white/20">
            <img
              alt="Areculateir helmet"
              src="/images/displaypicture.png"
              width={56}
              height={56}
              className="rounded-full border object-contain"
            />
          </div>
          <div>
            <div className="text-base font-medium text-white">
              Llewellyn Y. Fisher
            </div>
            <div className="text-sm text-white/80">
              Owner of Areculateir | Foresight into Reality | Made with Areculateirium⁷⁷
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
