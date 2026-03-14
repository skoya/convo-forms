import type { CrmPayload } from "@/lib/crm-sim/store";

type MarketerCrmPanelProps = {
  payloads: CrmPayload[];
};

export function MarketerCrmPanel({ payloads }: MarketerCrmPanelProps) {
  return (
    <section
      className="glass-panel rounded-[1.75rem] p-6 md:p-8"
      data-testid="crm-payload-inspector"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
        CRM simulation payload inspector
      </p>
      <div className="mt-4 space-y-4">
        {payloads.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-[var(--border)] px-4 py-4 text-sm text-[var(--muted)]">
            No CRM payloads yet. Submit a lead from a visitor experience to
            inspect the simulated delivery body.
          </p>
        ) : (
          payloads.map((payload) => (
            <details
              key={payload.deliveryId}
              className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-4"
            >
              <summary className="cursor-pointer text-sm font-semibold">
                {payload.variantId} · {payload.sessionId}
              </summary>
              <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-[var(--foreground)] p-4 text-xs leading-6 text-white">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </details>
          ))
        )}
      </div>
    </section>
  );
}
