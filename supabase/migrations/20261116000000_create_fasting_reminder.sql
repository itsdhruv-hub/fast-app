create extension if not exists "pgcrypto";

create table if not exists public.fasting_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fast_name text not null,
  fast_type text not null,
  fasting_date date not null,
  description text,
  is_recurring boolean not null default false,
  recurrence_day integer check (recurrence_day between 0 and 6),
  recurrence_group_id text,
  recurrence_limit integer check (recurrence_limit is null or recurrence_limit > 0),
  reminder_enabled boolean not null default true,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'saved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fasting_events
  add column if not exists recurrence_limit integer check (recurrence_limit is null or recurrence_limit > 0);

create table if not exists public.fasting_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fasting_event_id uuid references public.fasting_events(id) on delete set null,
  fast_name text not null,
  fast_type text not null,
  fasting_date date not null,
  completion_status text not null default 'saved',
  saved_at timestamptz not null default now()
);

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reminders_enabled boolean not null default true,
  daily_reminder_frequency integer not null default 4 check (daily_reminder_frequency in (3, 4)),
  reminder_times jsonb not null default '["08:00", "12:00", "17:00", "21:00"]'::jsonb,
  previous_night_time time not null default '21:00',
  morning_time time not null default '05:00',
  evening_time time not null default '17:00',
  timezone text not null default 'Asia/Kolkata',
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fasting_event_id uuid references public.fasting_events(id) on delete cascade,
  notification_identifier text not null,
  scheduled_at timestamptz not null,
  notification_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists fasting_events_date_idx on public.fasting_events (fasting_date);
create index if not exists fasting_events_user_date_idx on public.fasting_events (user_id, fasting_date);
create index if not exists fasting_events_recurrence_idx on public.fasting_events (recurrence_group_id, fasting_date);
create index if not exists fasting_history_user_date_idx on public.fasting_history (user_id, fasting_date desc);
create index if not exists notification_logs_event_idx on public.notification_logs (fasting_event_id);

alter table public.fasting_events enable row level security;
alter table public.fasting_history enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "events_owner_or_personal" on public.fasting_events;
create policy "events_owner_or_personal" on public.fasting_events
  for all using (user_id = auth.uid() or (user_id is null and auth.uid() is null))
  with check (user_id = auth.uid() or (user_id is null and auth.uid() is null));

drop policy if exists "history_owner_or_personal" on public.fasting_history;
create policy "history_owner_or_personal" on public.fasting_history
  for all using (user_id = auth.uid() or (user_id is null and auth.uid() is null))
  with check (user_id = auth.uid() or (user_id is null and auth.uid() is null));

drop policy if exists "settings_owner_or_personal" on public.notification_settings;
create policy "settings_owner_or_personal" on public.notification_settings
  for all using (user_id = auth.uid() or (user_id is null and auth.uid() is null))
  with check (user_id = auth.uid() or (user_id is null and auth.uid() is null));

drop policy if exists "logs_owner_or_personal" on public.notification_logs;
create policy "logs_owner_or_personal" on public.notification_logs
  for all using (user_id = auth.uid() or (user_id is null and auth.uid() is null))
  with check (user_id = auth.uid() or (user_id is null and auth.uid() is null));

create or replace function public.set_fasting_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fasting_events_updated_at on public.fasting_events;
create trigger fasting_events_updated_at
before update on public.fasting_events
for each row execute function public.set_fasting_events_updated_at();
