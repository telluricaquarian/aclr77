import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
      {/* Header / Hero */}
      <div className="w-full text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border bg-white shadow-sm">
          <Image
            src="/images/Aaisolate.png"
            alt="Areculateir logo"
            width={32}
            height={32}
            className="h-8 w-8 select-none object-contain"
            priority
          />
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Page not found{" "}
          <span className="font-redaction italic text-orange-500">(404)</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Either the link is broken, or this route was never meant to ship.
          <br />
          The good news: the system’s fine. The better news: you’re still in the right place.
        </p>
      </div>

      {/* Card */}
      <section className="mt-12 w-full max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-black/10">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-zinc-600 sm:text-base">
              Choose a direction:
            </p>

            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              >
                Go home
              </Link>

              <Link
                href="/proposal"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              >
                Generate a proposal
              </Link>

              <Link
                href="/prototype"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              >
                Generate a prototype
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              If you typed the URL manually, respect. But also… maybe don’t.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
