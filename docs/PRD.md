# FoodSport product requirements v0.1

## Goal
A personal, multi-user-ready digital coach combining food, weight, training and health records.

## MVP
1. Sign-in and user-scoped profiles.
2. Food diary: text/photo entry, estimated calories/protein/fat/carbs, source/confidence, editable serving size and explicit corrections.
3. Daily summary and week-over-week weight chart; configurable goals.
4. Training log with activity types and perceived exertion.
5. AI chat that reads only authorized records and suggests actions requiring confirmation.
6. Export of user data in JSON/CSV.

## Next
Polar AccessLink OAuth, consented activity import, training-load/recovery dashboard, lab document upload and structured metrics.

## Later
Push reminders (browser, Telegram or compatible watch channels); optional external training services.

## Acceptance criteria
- Users cannot read another user's records.
- Manual corrections persist and take precedence over AI estimates.
- Missing sleep data are displayed as unavailable, never negative.
- Every imported Polar activity has source ID and sync status for deduplication.
- AI recommendations show evidence and do not change critical settings without approval.
- User can export and request deletion of their data.

## Non-goals
Medical diagnosis or automated prescriptions; guaranteed access to all Polar recovery indicators; publishing personal health data in GitHub.
