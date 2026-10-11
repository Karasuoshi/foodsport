# Release checklist — 2026-10-11

## Publication
- [x] Repository visibility is public (checked through GitHub connection).
- [x] Static Next.js export configuration is committed.
- [x] GitHub Pages workflow is committed.
- [ ] Confirm Pages source is set to GitHub Actions in repository settings (connector cannot change it).
- [ ] Confirm latest Pages workflow completed successfully (connector cannot list push runs).
- [ ] Verify live URL returns the app, not 404.
- [ ] Clean sensitive historical commits before sharing public git history further.

## Nutrition diary acceptance checks
- [ ] Open Food tab, select 2026-10-12.
- [ ] Add "Test chicken": 250g, per 100g 120 kcal, protein 20g, fat 3g, carbs 4g.
- [ ] Expect 300 kcal, P 50g, F 7.5g, C 10g (display may round to integers).
- [ ] Edit portion to 150g; expect 180 kcal and P 30g.
- [ ] Switch to 2026-10-13; entry must not appear.
- [ ] Return to 2026-10-12; entry must reappear.
- [ ] Refresh; entry must persist in the same browser.
- [ ] Export JSON; verify the entry is present with correct date and grams.
- [ ] Delete entry; day totals must return to zero.
- [ ] Check phone-width layout and keyboard navigation.

## Weekly planner acceptance checks
- [ ] Open "План недели" and see 12–18 October 2026.
- [ ] Mark a task done, refresh, verify checked state persists.
- [ ] Add a task on a date within the week; refresh and verify persistence.
- [ ] Delete test task.

## Known constraints
The current UI stores data in localStorage without authentication or cloud backup. Test with fictional records only. The application does not connect to Polar or an AI model. Tests are committed, but their CI execution is not yet independently verified.
