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

## Product pivot: zero-friction nutrition capture (2026-10-11)
The owner rejected the manual six-field food form as the primary experience. Primary UX MUST be conversational multimodal intake: arbitrary natural-language messages, typo-tolerant descriptions, photos of food/packaging/labels/menus/receipts, optional follow-up corrections, transparent estimated portions/macros, confirmation then diary entry. Manual entry is fallback only.
Current implementation adds a conversational inbox and photo picker, but **DOES NOT HAVE AI ANALYSIS**. Inbox drafts store only text and filename in localStorage; selected image is preview-only and discarded after submit. Do not describe it as photo recognition or automatically calculated nutrition.
Next engineering priority: secure server API (never ship AI key to browser) with provider-independent multimodal adapter; photo upload and temporary processing with explicit retention policy; structured output validation (dish items, portion, nutrition, source, confidence, assumptions); user confirmation/correction; idempotent save; error handling; privacy, cost controls, integration tests. Deploy backend separately from static GitHub Pages. Do not use fabricated values or send private images to external AI services without consent and disclosed processing.

## Architecture decision: ChatGPT-first input, FoodSport as read-only dashboard (2026-10-11)
Owner prefers logging meals through ChatGPT conversation or an assistant agent, not via FoodSport forms. ChatGPT interprets free text/photos; an explicit confirmation writes structured meal records to a shared secure backend; FoodSport reads the same backend to visualize progress. The website is principally a dashboard. No copy-paste or duplicate entry should be required.
Important: GitHub repository is for code and agent handoff ONLY; do not write real meals, photos, health records, credentials, or user-specific diary JSON into public GitHub. The current GitHub connector has no general secure backend write path and cannot make this chat automatically persist meals to the live website. Never claim end-to-end synchronization before backend and a ChatGPT-accessible authenticated connector/plugin are deployed and tested.
See docs/CHAT_FIRST_ARCHITECTURE.md. Prioritize secure storage/API, then authenticated ChatGPT connector, then dashboard API reads; retire the localStorage diary once migration is safe. User approvals for changes and corrections are essential.

## Product copywriting rule (2026-10-11)
User's conversational instructions are design context, not UI copy. Never paste or closely paraphrase user messages as headings, banners, placeholders or product marketing. Write concise, natural, product-appropriate Russian. Do not clutter the public-facing dashboard with internal implementation notes, agent language or technical explanations. Site is a visualization layer, with ChatGPT as the intended meal intake interface. Until synchronization exists, show an accurate, understated empty state rather than fake chat/photo upload controls.

## Food diary completeness/backfill rule (2026-10-11)
Every calendar day needs explicit diary confirmation; missing records are NOT evidence of fasting or zero calories. User may backfill meals one or several days later via ChatGPT; entries must be assigned to the actual meal date, not message timestamp. Site currently provides a rolling list of unconfirmed past 14 days, explicit day confirmation, and ChatGPT backfill prompt copy. These are browser-local only. The shared backend must persist day-level completeness status, missing-day backlog and source timestamps, expose them to both chat connector and website, and allow user corrections/reopening days. No automatic chat reminder is active unless a real scheduled automation and connector are configured.
