-- Applied remotely to fmfvrefupuyfbtktxxtl (migration public_read_single_owner). Schema only, no personal data.
-- One owner, no login: everyone may read, only the agent (postgres via the Supabase connector) writes.
create table public.food_entries (id text primary key, date date not null, name text not null, grams numeric not null check(grams>0), kcal100 numeric not null, protein100 numeric not null, fat100 numeric not null, carbs100 numeric not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.weights (id text primary key, date date not null unique, value numeric not null check(value>0), updated_at timestamptz not null default now());
create table public.trainings (id text primary key, date date not null, type text not null, minutes numeric not null, notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.day_reviews (date date primary key, status text not null default 'complete', score integer check (score between 1 and 10), comment text, updated_at timestamptz not null default now());
create table public.plan_items (id text primary key, date date not null, title text not null, done boolean not null default false, updated_at timestamptz not null default now());
create table public.settings (
  id smallint primary key default 1 check (id = 1),
  kcal_target integer check (kcal_target between 800 and 6000),
  protein_min integer check (protein_min between 0 and 400),
  protein_max integer check (protein_max between 0 and 400),
  weight_goal numeric check (weight_goal > 0),
  updated_at timestamptz not null default now(),
  check (protein_min is null or protein_max is null or protein_min <= protein_max)
);
create index on public.food_entries(date);
create index on public.trainings(date);
create index on public.plan_items(date);
do $$ declare t text; begin foreach t in array array['food_entries','weights','trainings','day_reviews','plan_items','settings'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to anon, authenticated',t);
  execute format('create policy public_read on public.%I for select to anon, authenticated using (true)',t);
end loop; end $$;
