import Image from "next/image"
import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl">
      <div className="grid items-center gap-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <h2
            id="cta-title"
            className="scroll-my-60 text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl"
          >
            Ready to get started?
          </h2>
          <p className="mt-3 mb-8 text-lg text-gray-600">
            Start building your prototype A.S.A.P or talk to our team
            about your specific needs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="text-md">
              <Link href="#">Start now</Link>
            </Button>
          </div>
        </div>

        {/* Image side */}
        <div className="relative isolate rounded-xl sm:col-span-4">
          {/* Give the media a definite height via aspect ratio */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
            {/* Blurred glow layer */}
            <Image
              aria-hidden
              alt="aclrthumb"
              src="/images/aclrthumb.png"
              fill
              priority
              sizes="(min-width: 640px) 66vw, 100vw"
              className="absolute inset-0 -z-10 blur-xl object-cover"
            />
            {/* Main sharp image */}
            <Image
              alt="aclrthumb"
              src="/images/aclrthumb.png"
              fill
              priority
              sizes="(min-width: 640px) 66vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
