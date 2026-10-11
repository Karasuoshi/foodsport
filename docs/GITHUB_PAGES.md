# FoodSport on GitHub Pages

The site is configured for static Next.js export at https://karasuoshi.github.io/foodsport/.

## Steps
1. Keep developing in the private repository while visibility change is rate-limited.
2. Once public, go to Settings -> Pages -> Build and deployment -> Source: GitHub Actions.
3. Open Actions -> Publish FoodSport to GitHub Pages and run the workflow if necessary.
4. Confirm the deploy job succeeds and visit the URL above.

## Limits
GitHub Pages hosts static assets only: no server-side Next.js API routes, no server-side OAuth secrets, no PostgreSQL and no authenticated multi-user storage. This prototype stores demo records in browser localStorage. Do not enter real personal medical data.

## Privacy before making public
README personal measurements have been removed from the latest version, but previous commits retain history. Review full git history before publication. If any sensitive information was committed, purge it from history or create a clean public repository instead.
