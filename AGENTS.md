# FoodSport agent instructions

Read docs/PRD.md and docs/ARCHITECTURE.md before making changes.
Keep all personal data out of source control and public logs.
Nutrition: distinguish label-verified values from estimates; ask cooked vs raw weight when material; support user corrections and never silently overwrite them. Do not infer precise macros from photos alone.
Coach: be concise, direct and evidence-aware; no shaming. Weekly trend matters more than one weigh-in. Avoid treating a calorie target as a mandatory minimum.
Polar: import only consented scopes. Do not infer sleep quality from missing data. Different Vantage models may expose different metrics.
Health: no autonomous diagnosis, medication changes or treatment recommendations. Flag concerning results for clinician review.
Autonomy: proposing plans is allowed; require explicit user approval before materially changing goals, workout schedules, medical data or external actions.
Interoperability: keep OpenAPI contracts versioned, document MCP adapters, and do not couple data to one LLM vendor.
Tests: add unit tests for calorie arithmetic, correction precedence, timezone handling and multi-tenant isolation.

## Current implementation and handoff (2026-10-11)
- Source of truth: this GitHub repository. Every agent must commit implementation, tests, docs and relevant decisions here, not just describe changes in chat.
- Frontend: Next.js 14 static export under /foodsport, GitHub Pages workflow at .github/workflows/pages.yml.
- Demo state is localStorage, **not secure or synced**. Do not enter real medical records.
- Weekly planner: 12–18 October 2026, localStorage key fs-plan-2026-10-12-v1; initial tasks are editable examples, not a personalized prescription.
- Nutrition tests: tests/food.test.ts, run npm test; CI also runs TypeScript and production build.
- Before announcing a live URL, independently verify Pages deploy succeeded and site returns actual content. GitHub connector does not currently expose Pages settings or complete push-workflow listings.
- **Public history warning:** an earlier README commit included private personal measurements. Current file edits do not remove commit history. Coordinate an approved history cleanup; do not falsely claim sanitized.
- Next milestones: verify CI and Pages, exercise diary create/edit/delete/date and persistence in deployed app, then design secure backend/auth and AI provider gateway.
