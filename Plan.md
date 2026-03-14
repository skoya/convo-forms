# Prototype Plan (v2) for Codex
## Marketer-Configured Conversational Wealth Experience (Next.js)

## 0) Mission
Build a **single Next.js prototype app** that proves:
1. A marketer can configure a conversational campaign journey from social ads.
2. Visitors can engage in a rich chat experience with curated/retrieved UBS.com public content.
3. Qualified leads can be captured (with consent controls) and handed to a **simulated CRM endpoint**.

This is a **prototype**, not a production banking platform.

---

## 1) Non-Negotiable Execution Rules (must-follow)

1. Deliver in strict **stages** (no big-bang build).
2. Each stage must include:
   - implementation
   - tests (unit/integration where relevant)
   - **Playwright E2E** for user-visible behavior
3. Before moving to next stage, all must pass:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run test:e2e`
4. After each stage, produce a short reflection:
   - what was built
   - what remains risky
   - what was hardened before advancing
5. Codex may run one hardening mini-iteration after reflection.
6. If any test fails, **fix before continuing**.
7. No flaky progression: stage considered green only if full test suite passes **twice consecutively**.
8. Commit/tag at each green stage checkpoint (`stage-1-green`, etc.).

---

## 2) Product Scope

## 2.1 Core concept
- Social-ad click lands visitor into a conversational wealth experience.
- Marketer configures experience via setup chat.
- Visitor receives recommendations/content cards + conversational guidance.
- Visitor can submit details for advisor follow-up.

## 2.2 Persona + vertical
- Visitor target: **HNW / UHNW**
- Sector: **Wealth management**

## 2.3 Two distinct experiences
1. **Marketer interface**
   - Setup chat
   - Campaign + variant management (A/B)
   - Lead schema controls
   - Qualification/safety/compliance/language toggles
   - Analytics dashboards
   - CRM simulation payload inspector
2. **Visitor interface**
   - Neutral chatbot UI
   - Rich content recommendations
   - Consent/compliance gating before PII
   - Optional qualification
   - Lead capture

## 2.4 Configurability requirements
Marketer must be able to configure:
- conversion goal (sample list)
- lead fields (editable)
- qualification step on/off
- identity strategy (anonymous-first vs early identification)
- safety profile
- language set
- content mode (curated list vs runtime retrieval simulation)
- layout simulation (embedded vs full-screen)

## 2.5 Technical constraints
- Single Next.js app
- Simulated marketer auth
- In-memory/mock storage
- Responsive mobile + desktop
- Demo seed mode
- In-app walkthrough + written playbook

---

## 3) Architecture Baseline

## 3.1 Stack
- Next.js (App Router)
- TypeScript
- Tailwind (or equivalent)
- Playwright E2E
- Vitest/Jest + Testing Library

## 3.2 Core domain contracts (define early; do not drift)
```ts
type Campaign = {
  id: string;
  name: string;
  adContext: {
    source?: string;
    audience?: string;
    headline?: string;
    promise?: string;
    cta?: string;
  };
  createdAt: string;
};

type ExperienceVariant = {
  id: string;
  campaignId: string;
  name: string;
  conversionGoal: string;
  contentMode: "curated" | "runtime-simulated";
  curatedUrls: string[];
  languages: string[];
  qualificationEnabled: boolean;
  consentRequired: boolean;
  safetyProfile: "educational-only" | "marketer-defined";
  identificationMode: "anonymous-first" | "early-identification";
  leadFields: Array<{ key: string; label: string; required: boolean; type: string }>;
  layoutMode: "embedded" | "fullscreen";
  sharePath: string;
  createdAt: string;
};

type Lead = {
  id: string;
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

type AnalyticsEvent = {
  eventId: string;
  timestamp: string;
  eventType:
    | "session_start"
    | "message_sent"
    | "recommendation_click"
    | "consent_given"
    | "qualification_complete"
    | "lead_submit";
  campaignId: string;
  variantId: string;
  sessionId: string;
  language?: string;
  source?: string;
  adContext?: string;
  metadata?: Record<string, unknown>;
};
```

## 3.3 Retrieval simulation rule (important)
- **Do not build live crawler/search infra.**
- Runtime mode should simulate retrieval from preloaded UBS URL fixtures + scoring heuristic.
- Keep implementation prototype-safe and deterministic for tests.

---

## 4) Compliance + messaging guardrails

Mandatory prototype copy in visitor flow:
1. “This chatbot provides educational information only and not personalized investment advice.”
2. “For tailored recommendations, speak with a licensed advisor.”
3. Consent language before lead submit:
   - contact consent checkbox
   - privacy notice acknowledgment checkbox

Where shown:
- Initial visitor disclosure panel
- Pre-PII capture gate
- Footer/link in visitor UI

---

## 5) Stage Plan (strict order)

## Stage 1 — Scaffold + Quality Harness

### Build
- Initialize app, routes (`/`, `/marketer`, `/experience/[id]`).
- Set up repositories (`CampaignRepo`, `ExperienceRepo`, `LeadRepo`, `AnalyticsRepo`).
- Implement simulated auth guard for marketer routes.
- Add demo seed endpoint/action.

### Tests
- Unit: repository CRUD + contract shape checks.
- Playwright:
  - landing loads
  - marketer route blocked when not authenticated
  - demo seed creates expected entities

### Acceptance criteria
- All test commands green twice consecutively.
- No TypeScript `any` in core domain contracts.

### Reflection
- Architecture suitability and known constraints.

---

## Stage 2 — Marketer Setup Chat + Variant Creation

### Build
- Setup chat collects required configuration.
- Saves 1+ experience variants.
- Generates shareable links.
- Supports creation of A/B variants.

### Tests
- Unit: schema validation + defaults.
- Component: setup state transitions.
- Playwright:
  - complete full setup
  - create two variants
  - verify share links resolve

### Acceptance criteria
- New variant can be created in ≤8 guided steps.
- Validation errors are user-readable.

### Reflection
- UX friction points and config coverage gaps.

---

## Stage 3 — Visitor Conversation + Rich Content

### Build
- Chat runtime bound to variant config.
- Content cards rendered in conversation.
- Curated mode uses configured/sample UBS URLs.
- Runtime-simulated mode uses fixture retrieval simulation.
- Language profile support enabled.

### Tests
- Unit: recommendation ranking + selection.
- Playwright:
  - visitor journey end-to-end
  - recommendation display and click events
  - language behavior matches variant config

### Acceptance criteria
- Recommendation cards include title + source URL + rationale snippet.
- No dead-end conversation states in primary happy path.

### Reflection
- Explainability + transition smoothness.

---

## Stage 4 — Consent, Qualification, Lead Capture, CRM Simulation

### Build
- Consent gate before any PII submit.
- Qualification shown only when enabled.
- Configurable lead fields respected.
- Simulated CRM delivery log and payload inspector in marketer UI.

### Tests
- Unit: consent logic, payload builder.
- Playwright:
  - submit blocked without required consent
  - qualification toggle behavior
  - successful lead emits CRM simulation event
  - marketer can inspect payload

### Acceptance criteria
- Lead payload includes campaignId, variantId, sessionId, consent timestamp.
- Error states shown for incomplete required fields.

### Reflection
- Compliance clarity and form usability.

---

## Stage 5 — Analytics + A/B Dashboard

### Build
- Event pipeline for required events.
- Dashboard sections:
  - basic metrics
  - funnel drop-off
  - variant comparison
  - language/source/ad context splits

### Tests
- Unit: aggregators + edge cases.
- Playwright:
  - simulate traffic across variants
  - conversion deltas visible
  - funnel math consistent with event logs

### Acceptance criteria
- Metrics stable across page refresh (within in-memory session lifecycle assumptions).
- Variant comparison view clearly labels denominator definitions.

### Reflection
- signal quality vs noisy metrics.

---

## Stage 6 — Demo Mode + Walkthrough + Playbook

### Build
- Demo seed button with realistic sample campaign/variants/chats/leads.
- In-app guided tour.
- Written playbook page for marketers (how to run demo in <10 minutes).

### Tests
- Playwright:
  - demo seed produces showcase-ready data
  - guided tour completes
  - playbook sections exist and are readable

### Acceptance criteria
- New user can complete first demo run in ≤10 minutes using playbook only.

### Reflection
- onboarding clarity and confusion points.

---

## Stage 7 — Hardening + Final QA

### Build
- Accessibility basics (labels, focus order, keyboard nav, contrast).
- Responsive sweep for mobile/tablet/desktop.
- Error handling and empty states.
- Lightweight performance sanity pass.

### Tests
- Cross-viewport Playwright smoke.
- Full regression run.

### Acceptance criteria
- Zero critical accessibility violations in basic automated checks.
- Full suite passes twice consecutively.
- No known blocker bugs in demo paths.

### Reflection
- Prototype-to-production gap register.

---

## 6) Definition of Done (global)
Done only if:
1. All 7 stages completed in order.
2. Each stage has passing tests + reflection.
3. Full command suite green twice consecutively.
4. Primary marketer and visitor journeys covered by Playwright.
5. A/B, analytics, consent, lead capture, CRM simulation verified.
6. Demo mode + guided walkthrough + written playbook complete.

---

## 7) Stage Output Template (Codex must emit each stage)
1. Stage plan (≤10 bullets)
2. Files changed
3. Tests added/updated
4. Command outputs summary
5. Reflection (built / risks / hardening)
6. Optional hardening mini-iteration
7. “Ready for next stage” (only if green)
8. Artifacts:
   - key screenshots
   - updated test matrix
   - open risk list

---

## 8) Recovery Protocol
If a stage destabilizes:
1. Revert to last green tag.
2. Reapply in smaller slices.
3. Re-run full command suite.
4. Document root cause and mitigation.

---

## 9) Out-of-scope (prototype)
- Real CRM writes
- Real advisor scheduling integrations
- Real SSO/auth
- Production legal/compliance automation
- Production-grade UBS ingestion pipeline

---

## 10) Nice-to-have (after all green)
- Export/import configuration JSON
- Variant cloning wizard
- Synthetic traffic generator
- Session replay viewer

---

## 11) Final instruction to Codex
Optimize for **incremental delivery + deterministic tests + reviewability**. Keep implementation simple but structurally extensible for production follow-on.
