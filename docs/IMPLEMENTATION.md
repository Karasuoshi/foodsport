# FoodSport v0.2 implementation notes

## Running locally
Install Node.js 20+, run `npm install`, then `npm run dev` and open http://localhost:3000.

## Implemented
- Responsive Russian-language dashboard and navigation.
- Manual food diary, portion-scaled kcal/P/F/C and edit/delete.
- Date selector, daily totals and goal progress bars.
- Weight entry and simple trend chart.
- Multi-sport training log.
- Health page placeholder.

## Limitations / safety
This is a browser-only **prototype**. Records are stored in localStorage and are not encrypted, authenticated, synced or backed up. Use invented/test data only. Do not enter personal medical information or sensitive records. No Polar connection, photo recognition or AI backend is active.

## Next
Implement secure multi-user backend, PostgreSQL, authentication, tests and real user-scoped APIs. Only then migrate private records and integrate Polar and AI.
