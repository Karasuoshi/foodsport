# Conversational food intake: implementation contract

## Goal
The user sends free-form Russian text, typos, images of meals, labels, menus or receipts, or any combination. The app extracts a **proposed** diary entry, not an authoritative nutrition fact. The user can reply "половину съел", "без масла", "было 180 грамм" and the assistant adjusts the proposal without demanding manual macro entry.

## UX
1. Single chat-like composer with photo attachments, drag/drop and mobile camera.
2. Visible preview of what was received; progress/errors while analysis runs.
3. Structured suggestion with separate dishes, grams, calories and P/F/C, plus whether numbers came from label, verified database or AI estimate.
4. One-tap "Записать" and natural-language correction; ask a follow-up only when a missing detail materially changes the estimate.
5. Diary entries retain provenance and edit history. Never overwrite user-corrected values silently.

## Backend
GitHub Pages is static. A secure HTTPS backend is mandatory for real multimodal AI processing. Secrets remain server-side. Use a versioned API (e.g. POST /v1/intake/analyze and POST /v1/intake/confirm), authentication, per-user isolation, rate limiting, size/MIME limits, safe image handling, data retention controls and a provider-independent adapter. AI must return schema-validated structured data, not untrusted raw prose as numbers. Do not store images in git, logs or unencrypted localStorage.

## Current reality
- Implemented: natural-language input, photo selection and local preview, locally persisted text-only draft queue, fallback manual diary.
- Not implemented: AI inference, OCR, actual image submission/storage, estimated KБЖУ, correction conversation, secure accounts/backend.
- Therefore the new interface is an honest **intermediate milestone**, not a completed photo food diary.

## Acceptance scenarios
- "съел две котлеты с пюрешкой" => proposed dish/portion estimates, clearly marked approximate.
- Meal photo => identify plausible components, express uncertainty in portion sizing.
- Package label photo => use legible printed values rather than hallucinated nutrition.
- Restaurant receipt => do not assume all purchased dishes were eaten.
- "нет, это не курица, а индейка" => revise without duplicate diary entry.
- Failed AI request => retain unsent draft and show retry; never invent macro totals.
