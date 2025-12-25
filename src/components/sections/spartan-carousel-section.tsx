export default function SpartanCarouselSection() {
    return (
        <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <video
                className="h-full w-full object-cover"
                src="/images/meta.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
            />

            {/* Optional cinematic overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        </section>
    )
}
