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
