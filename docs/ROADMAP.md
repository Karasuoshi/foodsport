# FoodSport delivery roadmap

## v0.2 — implemented in repository
- Next.js responsive browser-only UI: overview, food, weight, training, health placeholder.
- Manual food logging, editing and totals; weight chart and multi-sport training entries.
- GitHub Actions build workflow; GitHub Pages static export configuration.
- **Not verified**: production build status and public deployment.

## v0.3 — secure account infrastructure
- Auth, PostgreSQL, per-user authorization, migrations, tests and encrypted backups.
- Nutrition revision history, customizable goals, exports and account deletion.
- No personal health data in public git history.

## v0.4 — AI nutrition coach
- Server-side provider-agnostic model gateway and approval workflow.
- Structured meal extraction from text/photos with uncertainty and manual correction.
- Cost and usage controls.

## v0.5 — Polar
- Official AccessLink registration and OAuth2.
- Workouts and available training load/recovery signals, idempotent sync.
- Missing sleep neutral; do not invent unavailable watch metrics.

## v1.0 — integrated coach
- Lab records, longitudinal reports, training planning and consent-based AI recommendations.
- Multi-user administration, audit logs and operational monitoring.

## v2 — notifications
- Optional browser/Telegram reminders and training notifications.
- Watch notifications only if a supported Polar integration pathway exists.

## Infrastructure
GitHub Pages can host only the static demo. Auth, private records, Polar OAuth and AI secrets require a secure backend. Do not put sensitive data in browser localStorage.
