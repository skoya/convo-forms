export type CrmPayload = {
  deliveryId: string;
  campaignId: string;
  variantId: string;
  sessionId: string;
  data: Record<string, string>;
  consent: {
    contactConsent: boolean;
    privacyAccepted: boolean;
    timestamp: string;
  };
  qualification?: Record<string, string>;
  createdAt: string;
};

declare global {
  var __convoFormsCrmPayloads: CrmPayload[] | undefined;
}

const payloads = globalThis.__convoFormsCrmPayloads ?? [];

if (!globalThis.__convoFormsCrmPayloads) {
  globalThis.__convoFormsCrmPayloads = payloads;
}

export function listCrmPayloads(): CrmPayload[] {
  return [...payloads].reverse();
}

export function recordCrmPayload(payload: CrmPayload): CrmPayload {
  payloads.push(payload);
  return payload;
}

export function resetCrmPayloads(): void {
  payloads.splice(0, payloads.length);
}
