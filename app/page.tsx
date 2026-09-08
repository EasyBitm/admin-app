// import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { getSemesters } from "../src/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BITM Notes, Resources & Study Materials",
  description:
    "Find organized notes, lessons, syllabi, videos, and question papers for Bachelor in Information Technology and Management students.",
  openGraph: {
    title: "BITM Notes, Resources & Study Materials | easyBITM",
    description:
      "Organized semester resources and study materials for BITM students.",
  },
};

export default async function Home() {
  const semesters = await getSemesters({ includeHidden: true });
  const visibleSemesters = semesters.filter((s) => s.is_visible);
  const stats = [
    { label: "Semesters Covered", value: `${visibleSemesters.length || 8}` },
    // { label: "Subjects Listed", value: `${totalSubjects}+` },
    { label: "Cost to Use", value: "Free" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <section className="relative mx-auto my-5 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface/70 px-6 py-20 shadow-2xl shadow-black/20 sm:my-8 sm:w-[calc(100%-3rem)] sm:py-28 lg:py-36">
        {/* Decorative orbs */}
        <div aria-hidden="true" className="absolute right-[-10%] top-[-20%] h-72 w-72 rounded-full bg-accent-2/25 blur-3xl" />
        <div aria-hidden="true" className="absolute left-[-8%] bottom-[-10%] h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-20 h-2 w-2 rounded-full bg-accent animate-pulse"
        />
        <div
          aria-hidden="true"
          className="absolute right-10 top-40 h-1.5 w-1.5 rounded-full bg-accent-2 animate-pulse"
        />

        <div className="relative flex flex-col items-center justify-center gap-12 lg:items-start lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <h1 className="hero-title mt-0 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="inline-block">
                Your <span className="text-accent">simple</span> guide
              </span>
              <br />
              to ace every semester.
            </h1>

            <p className="hero-subtitle mt-5 max-w-lg text-muted leading-relaxed">
              Notes, guides, and organized resources — so you can focus on
              learning instead of hunting for materials.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-surface/90 px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-accent-2/60 hover:shadow-lg hover:shadow-accent-2/10"
              >
                <div className="text-xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#semesters"
              className="group relative overflow-hidden rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover-primary"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              Start Learning
            </a>
            <a
              href="#contact"
              className="rounded-full border border-accent-2/60 bg-accent-2/10 px-6 py-3 text-sm font-medium text-accent-2 transition-colors duration-200 hover:bg-accent-2 hover:text-white"
            >
              Contribute
            </a>
          </div>
        </div>

        {/* Quote card — stacked below hero on mobile, floating at right on desktop */}
        <div className="relative mt-2 flex w-full justify-center lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:h-96 lg:w-80 lg:-translate-y-1/2">
          <div className="flex h-full w-full max-w-xs flex-col items-center justify-center rounded-2xl border border-accent-2/30 bg-surface/90 p-8 shadow-lg shadow-accent-2/10 transition-shadow duration-300 hover:shadow-xl lg:max-w-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-2/15 text-accent-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12a8 8 0 1 1 16 0a8 8 0 0 1-16 0" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <blockquote className="mt-5 text-center text-base font-semibold leading-relaxed">
              “All power is within you; you can do anything and everything.”
              <footer className="mt-3 text-sm text-muted">
                — Swami Vivekananda
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section id="semesters" className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl mt-10 font-semibold">Semesters</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semesters.map((s) => (
            s.is_visible ? (
              <Link
                key={s.slug}
                href={`/semester/${s.slug}`}
                className="group flex min-h-32 items-center justify-between rounded-xl border border-border bg-surface px-6 py-6 transition-all hover:-translate-y-0.5 hover:border-accent-2/70 hover:bg-surface-2 hover:shadow-lg hover:shadow-accent-2/10"
              >
                <div>
                  <div className="text-lg font-medium">{s.name}</div>
                  <div className="text-sm text-muted">
                    {s.subjects.length} subjects
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-2/10 text-accent-2 transition-transform group-hover:translate-x-1">
                  &rsaquo;
                </span>
              </Link>
            ) : (
              <div
                key={s.slug}
                aria-disabled="true"
                className="flex min-h-32 cursor-not-allowed items-center justify-between rounded-xl border border-border bg-surface px-6 py-6 opacity-50"
              >
                <div>
                  <div className="text-lg font-medium">{s.name}</div>
                  <div className="text-sm text-muted">Coming soon</div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted">
                  &ndash;
                </span>
              </div>
            )
          ))}
        </div>
      </section>

      <section id="why" className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">
            Why <span className="text-accent">easy</span>BITM?
          </h2>
          <p className="mt-3 text-muted">
            Everything organized in one place, updated, and
            free to use.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/60">
              <div className="font-medium text-accent">Organized</div>
              <p className="mt-2 text-sm text-muted">
                Find exactly what you need without digging through folders.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/60">
              <div className="font-medium text-accent">Always Free</div>
              <p className="mt-2 text-sm text-muted">
                No paywalls, no subscriptions — just resources when you need
                them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">Help us improve</h2>
          <p className="text-muted">
            Found a bug or have a feature request? Let us know and help make
            this platform better.
          </p>
          <a
            href="mailto:easybitm@gmail.com"
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover-primary"
          >
            Send Feedback
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
