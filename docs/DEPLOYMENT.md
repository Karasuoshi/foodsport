# Deploying FoodSport (prototype)

## CI
GitHub Actions: Actions -> Verify FoodSport. The workflow runs TypeScript checks and a production Next.js build on pushes to main.

## Recommended deployment path
For the browser-only prototype, use a managed Next.js host with GitHub integration and automatic deployments. For production health data, choose a VPS and PostgreSQL in a jurisdiction appropriate for the users and applicable privacy laws. Verify Polar API connectivity, outbound HTTPS and backups before selecting a provider.

## What the operator must do
1. Open the repository's Actions tab and confirm the latest Verify FoodSport run passed.
2. Connect the private repository to a hosting account authorized by the owner.
3. Set the build command to `npm run build` and runtime to Node.js 20+.
4. Enable HTTPS and test the site on mobile and desktop.
5. Do not input real health or medical data: current prototype stores unencrypted data in browser localStorage.

## Future secure release
Use server-side authentication, PostgreSQL, encrypted backups, audit log, consent management and tenant isolation. Add Polar OAuth credentials as hosting secrets, never as repository files.

## Current status
No production deployment or live database is configured by this document.
