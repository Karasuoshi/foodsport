# Architecture decision log

- 2026-10-11: Product name FoodSport; GitHub repository Karasuoshi/foodsport, private.
- Primary user initially; multi-user capable from day one.
- Web dashboard + chat; nutrition estimates must be user-editable.
- Polar Vantage M/M2/M3 family; exact model pending. Prioritize workouts, training load and recovery.
- Sleep is optional and not scored when absent.
- Multiple sport types; individualized planning.
- AI can propose changes; material changes require approval.
- Push reminders postponed to v2.
- Hosting budget 1000–3000 RUB/month, AI costs separate.
- Source is model-agnostic: AGENTS.md, SKILL.md, OpenAPI and future MCP.
- Health analyses are informational and not autonomous medical decisions.
