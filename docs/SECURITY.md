# FoodSport security release gate

Do not switch this repository to public before reviewing **all historical commits**, not only current files. An earlier README commit contained an individual's age, height, weight and targets; removing those lines from the latest commit did not remove history.

Safer choices:
1. Create a clean public frontend repository with no private history; keep backend and private project documentation separate.
2. Rewrite git history using an approved process after backing up and reviewing all sensitive commits.

Before accepting real users: implement authentication, secure sessions, authorization per resource, encrypted backups, data export/deletion, rate limiting, audit trail, data retention and secrets management. GitHub Pages alone does not provide these.

Never add Polar client secrets or OAuth refresh tokens to static Next.js builds.
