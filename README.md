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

## Initial owner profile (illustrative, not production data)
Age 43, height 172 cm; last reported control weight 103.8 kg; target 90 kg; milestone 99.9 kg. Working nutrition goals 1900–2200 kcal and 120–150 g protein/day. These values must be user-editable, not hardcoded or assumed for others.

## Architecture
Next.js web application; TypeScript API; PostgreSQL with per-user access controls; Polar AccessLink OAuth; OpenAPI and MCP integration; provider-neutral agent instructions in AGENTS.md and skills/foodsport-coach/SKILL.md.

## Status
v0.1 planning/specification scaffold. No running app, deployed server or connected Polar account yet.

## Security
Never commit user records, API tokens, OAuth secrets or raw lab reports. Use private storage, encryption in transit, least-privilege credentials, user consent and export/delete workflows.

See docs/PRD.md, docs/ARCHITECTURE.md, docs/DECISIONS.md and api/openapi.yaml.
