import Link from "next/link";
import { cookies } from "next/headers";
import {
  isMarketerAuthenticated,
  MARKETER_SESSION_COOKIE,
} from "@/lib/auth/marketer-session";

export const dynamic = "force-dynamic";

export default async function MarketerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = isMarketerAuthenticated(
    cookieStore.get(MARKETER_SESSION_COOKIE)?.value,
  );

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-8">
        <section
          className="glass-panel w-full rounded-[2rem] px-6 py-8 md:px-10 md:py-10"
          data-testid="marketer-access-gate"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Simulated auth guard
          </p>
          <h1 className="display-font mt-4 text-4xl font-semibold">
            Marketer route is blocked until the demo session is enabled.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Stage 1 only requires a simulated guard. Use the auth link below to
            set a demo cookie and enter the marketer workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
              href="/api/auth/marketer?mode=login&redirect=/marketer"
            >
              Simulate marketer sign in
            </Link>
            <Link
              className="rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-semibold"
              href="/"
            >
              Return home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Marketer workspace
          </p>
          <h1 className="display-font mt-1 text-3xl font-semibold">
            Campaign prototype control room
          </h1>
        </div>
        <Link
          className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold"
          href="/api/auth/marketer?mode=logout&redirect=/"
        >
          Sign out
        </Link>
      </header>
      {children}
    </div>
  );
}
