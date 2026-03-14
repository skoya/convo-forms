import Link from "next/link";
import { experienceRepo } from "@/lib/repos";

export const dynamic = "force-dynamic";

type ExperiencePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ExperiencePage({
  params,
}: ExperiencePageProps) {
  const { id } = await params;
  const experience = experienceRepo.getById(id);

  if (!experience) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-8">
        <section
          className="glass-panel w-full rounded-[2rem] px-6 py-8 md:px-10 md:py-10"
          data-testid="experience-missing"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Experience not found
          </p>
          <h1 className="display-font mt-4 text-4xl font-semibold">
            Seed the demo data before opening this visitor route.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Stage 1 keeps visitor routing deterministic through fixed demo
            fixtures.
          </p>
          <Link
            className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            href="/"
          >
            Return to landing
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="glass-panel rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Visitor experience shell
        </p>
        <h1 className="display-font mt-3 text-4xl font-semibold">
          {experience.name}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          This chatbot provides educational information only and not
          personalized investment advice. For tailored recommendations, speak
          with a licensed advisor.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <article className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Variant configuration
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["Conversion goal", experience.conversionGoal],
              ["Content mode", experience.contentMode],
              ["Layout mode", experience.layoutMode],
              ["Identification", experience.identificationMode],
              ["Safety profile", experience.safetyProfile],
              ["Share path", experience.sharePath],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-[var(--border)] bg-white/70 px-4 py-4"
              >
                <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  {label}
                </dt>
                <dd className="mt-2 text-base font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <aside className="glass-panel rounded-[1.75rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Stage 1 readiness
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <li>Languages: {experience.languages.join(", ")}</li>
            <li>Qualification enabled: {String(experience.qualificationEnabled)}</li>
            <li>Consent required: {String(experience.consentRequired)}</li>
            <li>Lead fields: {experience.leadFields.map((field) => field.label).join(", ")}</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
