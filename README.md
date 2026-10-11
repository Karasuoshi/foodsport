# FoodSport

Private-first AI fitness, nutrition and health platform. Russian-first interface; portable agent instructions.

## Product
- Multi-user accounts with strict data isolation.
- Nutrition journal with AI estimates, confidence and user corrections.
- Weight goals, trends and weekly check-ins.
- Multi-sport workouts and Polar Vantage integration.
- Lab results and health observations for informational tracking, not diagnosis.
- AI coach with approval required for consequential changes.
- Sleep tracking optional; missing wearable sleep data never counts as poor recovery.
- Notifications postponed to v2.

## User data
Personal metrics, goals, health records and Polar credentials must be stored outside Git history. Configure user-specific targets inside the application after secure authentication is implemented.

## Architecture
Next.js web application; TypeScript API; PostgreSQL with per-user access controls; Polar AccessLink OAuth; OpenAPI and MCP integration; provider-neutral agent instructions in AGENTS.md and skills/foodsport-coach/SKILL.md.

## Status
v0.1 planning/specification scaffold. No running app, deployed server or connected Polar account yet.

## Security
Never commit user records, API tokens, OAuth secrets or raw lab reports. Use private storage, encryption in transit, least-privilege credentials, user consent and export/delete workflows.

See docs/PRD.md, docs/ARCHITECTURE.md, docs/DECISIONS.md and api/openapi.yaml.
