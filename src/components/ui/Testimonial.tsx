import Image from "next/image"

export default function Testimonial() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl shadow-[#366A79]/70">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          alt="clouds background"
          src="/images/brandingnew.png"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Helmet Image */}
      <div className="absolute top-76 -right-14 w-76 sm:top-48 sm:right-3 sm:w-92 md:top-48 md:right-0 md:w-100 lg:top-64 lg:right-12 lg:w-136">
        <Image
          alt="ACLR helmet"
          src="/images/helmetclean.png"
          width={1080}
          height={1080}
          className="animate-hover w-full h-auto object-contain"
        />
      </div>

      {/* Text Content */}
      <div className="relative z-20 mb-20 p-8 sm:p-14 lg:p-24">
        <div>
          <blockquote className="relative max-w-2xl text-xl leading-relaxed tracking-tight text-white md:text-2xl lg:text-3xl">
            <p className="before:absolute before:top-0 before:right-full before:content-['“'] after:text-white after:content-['”']">
              <strong className="font-semibold">
                Areculateir is founded and built by Llewellyn..
              </strong>{" "}
              <span className="text-white">
                The central service offering is high end UI element website /
                project builds. With discretionary media buying and funnel
                optimisation services, offered as indicated to the discretion of
                Llewellyn, owner of Areculateir
              </span>
            </p>
          </blockquote>
        </div>

        {/* Profile Section */}
        <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0 rounded-full bg-white/15 p-0.5 ring-1 ring-white/20">
            <Image
              alt="llewellyn"
              src="/images/llewellyn.png"
              width={56}
              height={56}
              className="rounded-full border object-contain"
            />
          </div>
          <div>
            <div className="text-base font-medium text-white">
              Llewellyn Y. Fisher
            </div>
            <div className="text-sm text-white">
              Owner of Areculateir | Foresight into Reality | Made with Areculateirium⁷⁷
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
