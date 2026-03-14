# Repository Agent Guide

## Operating Rules
- Treat [`/Users/bobby/Dev/convo-forms-v2/Plan.md`](/Users/bobby/Dev/convo-forms-v2/Plan.md) as the controlling implementation plan.
- Execute strictly in order from Stage 1 through Stage 7. Do not start a later stage until the current stage is fully green.
- A stage is green only after `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run test:e2e` all pass twice consecutively.
- Keep runtime retrieval deterministic and fixture-backed. Do not add live crawler or search infrastructure.
- Preserve strong TypeScript contracts for the core domain models. Do not introduce `any` into those contracts.

## Stage Reporting
- After each completed stage, emit the report sections defined in `Plan.md`.
- Include files changed, tests updated, command summaries, reflection, artifacts, and the ready-for-next-stage statement only when fully green.
- If a stage destabilizes, follow the recovery protocol in `Plan.md` before advancing.

## Repository Conventions
- Use in-memory or mock persistence unless a later stage explicitly requires otherwise.
- Keep tests deterministic and avoid flaky waiting patterns.
- Prefer additive, reviewable changes over large rewrites.
