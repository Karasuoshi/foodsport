-- Applied remotely. Schema only, no personal data.
-- Display order for meals and sessions
alter table public.food_entries add column if not exists created_at timestamptz;
update public.food_entries set created_at = updated_at where created_at is null;
alter table public.food_entries alter column created_at set default now(), alter column created_at set not null;

alter table public.trainings add column if not exists created_at timestamptz;
update public.trainings set created_at = updated_at where created_at is null;
alter table public.trainings alter column created_at set default now(), alter column created_at set not null;

-- Personal targets, one row per user
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kcal_target integer check (kcal_target between 800 and 6000),
  protein_min integer check (protein_min between 0 and 400),
  protein_max integer check (protein_max between 0 and 400),
  weight_goal numeric check (weight_goal > 0),
  updated_at timestamptz not null default now(),
  check (protein_min is null or protein_max is null or protein_min <= protein_max)
);
alter table public.settings enable row level security;
create policy owner_select on public.settings for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.settings for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.settings to authenticated;
