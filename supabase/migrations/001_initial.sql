-- ============================================================
-- KŌDO — Initial Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (profile table — extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  name          text,
  weight_unit   text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  rest_timer_default int not null default 90,
  created_at    timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- EXERCISES
-- ============================================================
create table if not exists public.exercises (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) on delete cascade,  -- null = global default
  name         text not null,
  muscle_group text not null check (muscle_group in ('chest','back','shoulders','arms','legs','core')),
  equipment    text,
  notes        text,
  created_at   timestamptz not null default now()
);

alter table public.exercises enable row level security;

-- Everyone can see global exercises (user_id is null)
create policy "Anyone can view global exercises"
  on public.exercises for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can insert own exercises"
  on public.exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exercises"
  on public.exercises for update
  using (auth.uid() = user_id);

create policy "Users can delete own exercises"
  on public.exercises for delete
  using (auth.uid() = user_id);

-- ============================================================
-- WORKOUT PLANS
-- ============================================================
create table if not exists public.workout_plans (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  day_of_week       int not null check (day_of_week between 0 and 6),  -- 0=Mon, 6=Sun
  exercise_id       uuid not null references public.exercises(id) on delete cascade,
  set_count         int not null default 3,
  rep_target        int not null default 10,
  weight_target_kg  numeric(6,2) not null default 0,  -- always kg
  rest_seconds      int not null default 90,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.workout_plans enable row level security;

create policy "Users can manage own workout plans"
  on public.workout_plans for all using (auth.uid() = user_id);

create index idx_workout_plans_user_day on public.workout_plans(user_id, day_of_week);

-- ============================================================
-- WORKOUT LOGS
-- ============================================================
create table if not exists public.workout_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  exercise_id     uuid not null references public.exercises(id) on delete cascade,
  date            date not null default current_date,
  set_num         int not null,
  reps_done       int not null,
  weight_done_kg  numeric(6,2) not null default 0,  -- always kg
  created_at      timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

create policy "Users can manage own workout logs"
  on public.workout_logs for all using (auth.uid() = user_id);

create index idx_workout_logs_user_exercise on public.workout_logs(user_id, exercise_id, date desc);
create index idx_workout_logs_user_date on public.workout_logs(user_id, date desc);

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.workout_logs;
alter publication supabase_realtime add table public.workout_plans;
