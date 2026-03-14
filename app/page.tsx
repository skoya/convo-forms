import Link from "next/link";
import { GuidedTour } from "@/components/guided-tour";
import { SeedDemoButton } from "@/components/seed-demo-button";
import { getRepositorySummary } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function Home() {
  const summary = getRepositorySummary();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-10 lg:px-12">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,_rgba(13,92,99,0.18),_transparent_68%)] md:block" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            <span>Stage 1</span>
            <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
            <span>Scaffold + Quality Harness</span>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.85fr]">
            <div className="space-y-6">
              <h1
                className="display-font max-w-3xl text-4xl leading-tight font-semibold md:text-6xl"
                data-testid="landing-title"
              >
                Conversational wealth journeys with deterministic prototype
                rails.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
                This single-app prototype scaffolds the marketer workspace, the
                visitor experience route, demo seeding, and the quality harness
                needed to advance stage-by-stage.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(13,92,99,0.18)]"
                  href="/marketer"
                >
                  Open marketer route
                </Link>
                <Link
                  className="rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
                  href="/experience/exp-ubs-wealth-curated"
                >
                  Open seeded visitor route
                </Link>
                <Link
                  className="rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
                  href="/playbook"
                >
                  Read playbook
                </Link>
              </div>
              <GuidedTour />
            </div>
            <div className="glass-panel rounded-[1.5rem] border-white/60 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Mandatory disclosures
              </p>
              <ul className="mt-4 space-y-4 text-sm leading-7 text-[var(--foreground)]">
                <li>
                  This chatbot provides educational information only and not
                  personalized investment advice.
                </li>
                <li>
                  For tailored recommendations, speak with a licensed advisor.
                </li>
                <li>
                  Consent language appears before personal information can be
                  submitted.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Demo seed
              </p>
              <h2 className="display-font mt-2 text-3xl font-semibold">
                Deterministic fixture bootstrap
              </h2>
            </div>
            <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Resettable
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            The demo seed initializes one campaign, two experience variants, a
            sample lead handoff, and analytics fixtures from fixed data so tests
            stay deterministic.
          </p>
          <SeedDemoButton initialSummary={summary} />
        </article>

        <aside className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Required routes
          </p>
          <div className="mt-4 space-y-4">
            {[
              {
                href: "/",
                title: "Landing",
                body: "Prototype entry point, disclosures, and demo seed action.",
              },
              {
                href: "/marketer",
                title: "Marketer",
                body: "Simulated auth-guarded workspace for campaign management.",
              },
              {
                href: "/experience/exp-ubs-wealth-curated",
                title: "Experience",
                body: "Visitor experience shell bound to a seeded variant id.",
              },
            ].map((route) => (
              <Link
                key={route.href}
                className="block rounded-[1.25rem] border border-[var(--border)] bg-white/70 px-5 py-4"
                href={route.href}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold">{route.title}</span>
                  <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    {route.href}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {route.body}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
