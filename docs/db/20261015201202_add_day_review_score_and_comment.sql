-- Applied remotely. Schema only, no personal data.
alter table public.day_reviews
  add column if not exists score integer check (score between 1 and 10),
  add column if not exists comment text;
