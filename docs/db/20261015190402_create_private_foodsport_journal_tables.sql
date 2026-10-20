-- Applied remotely. Schema only, no personal data.
create table public.food_entries (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, name text not null, grams numeric not null check(grams>0), kcal100 numeric not null, protein100 numeric not null, fat100 numeric not null, carbs100 numeric not null, updated_at timestamptz not null default now());
create table public.weights (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, value numeric not null check(value>0), updated_at timestamptz not null default now());
create table public.trainings (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, type text not null, minutes numeric not null, notes text not null default '', updated_at timestamptz not null default now());
create table public.day_reviews (user_id uuid not null references auth.users(id) on delete cascade, date date not null, status text not null, updated_at timestamptz not null default now(), primary key(user_id,date));
create table public.plan_items (id text primary key, user_id uuid not null references auth.users(id) on delete cascade, date date not null, title text not null, done boolean not null default false, updated_at timestamptz not null default now());
do $$ declare t text; begin foreach t in array array['food_entries','weights','trainings','day_reviews','plan_items'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',t);
  execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
  execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',t);
end loop; end $$;
