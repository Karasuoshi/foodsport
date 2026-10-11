# FoodSport architecture v0.1

## Components
- Web: Next.js, TypeScript, responsive Russian-first dashboard and chat.
- Backend: authenticated API, domain services, background jobs for integrations.
- Data: PostgreSQL with user_id ownership and row-level security or equivalent enforced authorization.
- Object storage: private encrypted uploads for food photos and lab documents.
- AI gateway: interchangeable providers; tools with read/write scopes and approval checkpoints.
- Polar adapter: OAuth2 AccessLink, encrypted refresh/access tokens, idempotent sync, rate-limit handling.
- Interoperability: OpenAPI, documented MCP tools, SKILL.md and AGENTS.md.

## Initial entities
users, profiles, goals, foods, food_entries, food_entry_revisions, weight_measurements, workout_sessions, polar_connections, polar_sync_events, lab_results, ai_recommendations, approvals, audit_events.

## Data rules
All measurements include units, source, timestamp and timezone. Distinguish raw vs cooked weight. Separate AI estimates from confirmed label data. Never modify historical corrected values without revision history.

## Privacy
Private-by-default repo and deployment; no production credentials in git; explicit user consent; role-based authorization, secure cookies, CSRF protection, audit logs, encrypted backups and data deletion/export.

## Deployment choice
Budget 1000–3000 RUB/month for infrastructure, excluding AI API usage. Compare VPS providers and regional personal-data requirements before selecting hosting. No deployment yet.
