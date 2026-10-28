-- Applied remotely to fmfvrefupuyfbtktxxtl. Schema only, no personal data.
create table public.food_entries (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, name text not null, grams numeric not null check(grams>0), kcal100 numeric not null, protein100 numeric not null, fat100 numeric not null, carbs100 numeric not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.weights (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, value numeric not null check(value>0), updated_at timestamptz not null default now());
create table public.trainings (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, type text not null, minutes numeric not null, notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.day_reviews (user_id uuid not null references auth.users(id) on delete cascade, date date not null, status text not null, score integer check (score between 1 and 10), comment text, updated_at timestamptz not null default now(), primary key(user_id,date));
create table public.plan_items (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, title text not null, done boolean not null default false, updated_at timestamptz not null default now());
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kcal_target integer check (kcal_target between 800 and 6000),
  protein_min integer check (protein_min between 0 and 400),
  protein_max integer check (protein_max between 0 and 400),
  weight_goal numeric check (weight_goal > 0),
  updated_at timestamptz not null default now(),
  check (protein_min is null or protein_max is null or protein_min <= protein_max)
);
create index on public.food_entries(user_id);
create index on public.weights(user_id);
create index on public.trainings(user_id);
create index on public.plan_items(user_id);
do $$ declare t text; begin foreach t in array array['food_entries','weights','trainings','day_reviews','plan_items','settings'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon',t);
  execute format('grant select, insert, update, delete on public.%I to authenticated',t);
  execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',t);
  execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
  execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',t);
end loop; end $$;
