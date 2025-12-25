import SpartanCarouselSection from "@/components/sections/spartan-carousel-section"
import { CallToAction } from "@/components/ui/CallToAction"
import FeatureDivider from "@/components/ui/FeatureDivider"
import Features from "@/components/ui/Features"
import { Hero } from "@/components/ui/Hero"
import { Map } from "@/components/ui/Map/Map"
import { SolarAnalytics } from "@/components/ui/SolarAnalytics"
import Testimonial from "@/components/ui/Testimonial"

export default function Home() {
  return (
    <main className="relative mx-auto flex flex-col">
      {/* Hero */}
      <div className="pt-56">
        <Hero />
      </div>

      {/* Features */}
      <div className="mt-52 px-4 xl:px-0">
        <Features />
      </div>

      {/* Testimonial */}
      <div className="mt-32 px-4 xl:px-0">
        <Testimonial />
      </div>

      {/* 🟠 Spartan MP4 Carousel Section (moved down) */}
      <div className="mt-32 px-4 xl:px-0">
        <SpartanCarouselSection />
      </div>

      <FeatureDivider className="my-16 max-w-6xl" />

      {/* Map */}
      <div className="px-4 xl:px-0">
        <Map />
      </div>

      <FeatureDivider className="my-16 max-w-6xl" />

      {/* Analytics */}
      <div className="mt-12 mb-40 px-4 xl:px-0">
        <SolarAnalytics />
      </div>

      {/* CTA */}
      <div className="mt-10 mb-40 px-4 xl:px-0">
        <CallToAction />
      </div>
    </main>
  )
}
