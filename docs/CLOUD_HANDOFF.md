# Cloud diary handoff — 2026-10-15

## Current contract
- Code: Karasuoshi/foodsport. Database: Supabase project kzyykhjjpalrhprcttow.
- Existing Supabase connector in ChatGPT can execute authorized journal SQL directly. No new AI API key or public write endpoint is required. This is an administrative connection, NOT a general multi-user OAuth connector.
- NEVER identify the owner merely because only one auth.users row exists. Confirm the account email with the user, resolve its UUID using auth.users, then use that UUID for every read/write. Do not persist the email or UUID in public source control.
- The user's report of a meal authorizes recording that meal; corrections update the existing ID. Verify owner and meal date, inspect existing records first, use a stable UUID-based entry ID across retries, and read the row back after writing. Do not create a new ID for a retry. User corrections take precedence.
- Dates use Europe/Moscow unless specified otherwise. Nutrition columns are per 100 grams; calculate totals as grams/100 times each column. Clearly disclose estimates in chat. Existing schema has no source/confidence fields: do not claim those are stored.
- Use parameterized SQL when the caller supports parameters. For execute_sql (query text only), safely encode string literals; never paste raw user text into SQL syntax. Use an explicit transaction, set local role authenticated and request.jwt.claims with the VERIFIED owner UUID so RLS is enforced. This is an administrator acting for the verified user, not a user login.
- INSERT food_entries: id,user_id,date,name,grams,kcal100,protein100,fat100,carbs100. ON CONFLICT(id) DO UPDATE only when food_entries.user_id equals the verified owner; set updated_at=now(). Check RETURNING gives exactly the expected row. Corrections must not reset unrelated fields. Confirm success only after readback.
- day_reviews: composite key (user_id,date), status complete/no-data, updated_at, nullable integer score 1–10 and nullable comment. Use ON CONFLICT(user_id,date) for SQL; REST uses on_conflict=user_id,date. A score is not proof the diary is complete. Do not mark incomplete days complete automatically.

## Browser sync
- Authenticated cloud data is authoritative. No automatic seed/localStorage upload: it could resurrect deletions, overwrite corrections, or assign another person's data to a new account.
- Legacy browser keys remain untouched for deliberate recovery. New caches are keyed by user UUID. Unsaved changes have a separate :unsaved key and are not silently retried/merged.
- Reload on focus, visibility, online and every 15s while visible. Writes within a mounted journal are queued. Pending/failed saves prevent background replacement of local edits.
- Auth refresh is deduplicated within one tab. Requests check expected user identity.
- Concurrent edits to the SAME row across devices still use last successful write wins. No revision history or conflict UI yet. Separate-tab refresh-token coordination remains untested.

## Verification and remaining work
- Local typecheck, production export and unit tests cover arithmetic, dates, serialization, account-specific cache keys, delta writes and review corrections.
- Transaction-only live database test: repeat review upsert updates the same composite key; a different JWT subject cannot read it. Test transaction rolls back.
- User confirmed matching cloud data on two physical devices. Live propagation of a new chat write still needs user confirmation. Remaining device checks: write from ChatGPT -> see on A/B within 15s; correction -> both update; reopen browser -> remains logged in; expired token refresh; failed connection -> recovery copy; deletion is not resurrected.
- Owner email was explicitly confirmed in the active conversation. Other agents must resolve identity from authorized context; do not infer it from a sole account.
- Supabase advisors report leaked-password protection disabled. No auth settings changed.
- Old personal seed data remains in repository/history; do not assert that history was sanitized. Cleanup needs a separate scoped plan.
- Other agents require separately authorized GitHub and Supabase access. Read AGENTS.md and this document; older instructions to log meals in GitHub are superseded.

## Dashboard follow-up
Weekly summary now names recorded activities and shows calories/protein without replacing them with a checkmark. Completed sessions are displayed separately from the code-based workout plan.
