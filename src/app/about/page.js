import {
  HeartHandshake,
  Users,
  Sparkles,
  PawPrint,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import SectionHeading from "../components/SectionHeading";

export default function AboutUs() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-orange-50 via-white to-green-50 overflow-hidden">
      {/* Soft gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-red-500 opacity-80 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 opacity-80 blur-[120px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        {/* Top: Intro + Side Card */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            {/* Logo with Heading - Better alignment */}
            <div className="flex items-start gap-4 md:gap-6 w-full md:justify-start justify-center">
              <Image
                alt="purrfect logo"
                src="/images/purrfect%20logo.png"
                width={100}
                height={100}
                className="h-16 w-auto object-contain flex-shrink-0 mt-1"
              />
              <div className="flex flex-col">
                <SectionHeading
                  eyebrow="About Purrfect"
                  title="A kinder platform for every rescue story."
                  align="left"
                  className="mb-0"
                />
              </div>
            </div>

            <p className="text-sm md:text-base leading-relaxed text-slate-700 max-w-xl">
              Purrfect brings rescuers, volunteers, and shelters together in one
              gentle space. Every logged activity, every shared story, and every
              tiny act of care turns into visible impact for animals in need.
            </p>

            <div className="mt-3 grid w-full gap-3 text-sm text-slate-700">
              <div className="inline-flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-green-600" />
                <span>Celebrate the humans behind every rescue.</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span>Turn everyday kindness into trackable impact.</span>
              </div>
            </div>

            {/* <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                <PawPrint className="h-4 w-4" />
                <span>Meet the Purrfect Community</span>
              </button>

              <button className="inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-900 border border-white/80 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2">
                <span>How Purrfect Works</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div> */}
          </div>

          {/* Right: Blurred Info Card */}
          <div className="flex-1 w-full max-w-sm">
            <div className="rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-lg p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-md">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Built for Rescuers
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    Simple, kind & impact-focused
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                  </span>
                  <span>Log rescue actions in seconds — not spreadsheets.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                  </span>
                  <span>
                    Reward volunteers with badges, stats, and gratitude.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                  </span>
                  <span>
                    Share rescue journeys that inspire others to join.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom: Blurred Value Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-md p-5 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <HeartHandshake className="h-4 w-4 text-orange-500" />
              <span>Our Mission</span>
            </div>
            <p className="text-sm text-slate-800">
              To weave technology and compassion together so that every animal,
              and every rescuer, feels seen and supported.
            </p>
          </div>

          <div className="rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-md p-5 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Users className="h-4 w-4 text-green-600" />
              <span>Community First</span>
            </div>
            <p className="text-sm text-slate-800">
              Purrfect grows with your feedback — rescuers, fosters, and
              adopters help shape every new feature we release.
            </p>
          </div>

          <div className="rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-md p-5 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Impact & Insights</span>
            </div>
            <p className="text-sm text-slate-800">
              Purrfect turns your real rescue activity into live insights — from
              missions logged to volunteers engaged and adoptions completed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
