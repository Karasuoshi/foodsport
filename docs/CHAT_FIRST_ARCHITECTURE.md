# FoodSport — ChatGPT-first architecture (decision 2026-10-11)

## Product principle
ChatGPT (this conversation or a dedicated connected agent) is the primary input. FoodSport website is primarily a visualization dashboard. User can send arbitrary Russian meal text, photos of dishes, packaging, nutrition labels, menus or receipts, and follow-up corrections. The assistant estimates portions and KБЖУ, distinguishes verified labels from estimates, and obtains confirmation for ambiguous/high-impact entries. Confirmed entries appear on the website without duplicate typing.

## Data flow
ChatGPT multimodal understanding → structured proposed meal JSON → user confirmation/correction → authenticated FoodSport write API → private database → read API → website dashboard.

## Requirements
- Secure private per-user database (Postgres or equivalent), login, scoped tokens, TLS, audit log and backups.
- POST /v1/meals/proposals (optional server-side) and POST /v1/meals to commit validated meals; PATCH /v1/meals/{id} for corrections; GET /v1/meals?date=YYYY-MM-DD for dashboard. Versioned OpenAPI and stable JSON schema.
- ChatGPT-accessible integration (custom connector / supported plugin or authenticated action) with minimum write scopes, idempotency key, explicit confirmation and revocation.
- Store timestamps with timezone, source=chatgpt, estimation provenance, confidence/uncertainty, grams, energy and macros, meal category, revision history.
- Dashboard polling or refresh to show changes, weekly totals and trends.
- Never use a PUBLIC GitHub repository, Actions logs, GitHub Issues or commits as the health diary database.
- Static GitHub Pages can host dashboard UI, but the authenticated API/database must be hosted separately.
- Never expose database or AI provider secrets in frontend or public repo.
- No real chat-to-website sync currently exists; do not promise it before implementation and end-to-end verification.

## Proposed staged delivery
1. Agree schema and implement backend authentication/storage and OpenAPI contract.
2. Implement dashboard read API, replace localStorage-only source with authenticated remote fetch; add tests.
3. Build ChatGPT-accessible write connector with user-granted access; test proposed→confirm→save→dashboard refresh.
4. Test free-text, photos, typo corrections, duplicate prevention, timezones, partial meals, outages, privacy and export.
5. Add weight, training and Polar imports on the same secure user-scoped data layer.

## Acceptance test
User sends "съел две котлеты с пюрешкой" in ChatGPT, sees approximate macros and approves. Assistant invokes authorized connector to write a structured meal. Refreshing FoodSport for that date displays exactly one meal, totals updated. A correction changes that same record; no duplicate is created. API errors are visible, never represented as success.
