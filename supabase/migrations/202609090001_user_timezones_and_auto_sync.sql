alter table public.profiles
  add column if not exists time_zone text not null default 'UTC',
  add column if not exists time_zone_detected_at timestamptz,
  add column if not exists auto_sync_enabled boolean not null default true;

alter table public.daily_progress
  alter column refresh_count set default 0;

create index if not exists profiles_auto_sync_enabled_idx
  on public.profiles (auto_sync_enabled)
  where auto_sync_enabled = true and x_username is not null;

create table if not exists public.auto_sync_runs (
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  slot text not null check (slot in ('midday', 'end_of_day')),
  status text not null check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  attempt_count integer not null default 1,
  error text,
  primary key (user_id, local_date, slot)
);

alter table public.auto_sync_runs enable row level security;

create policy "Users can view their own automatic sync history"
  on public.auto_sync_runs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.claim_auto_sync(
  p_user_id uuid,
  p_local_date date,
  p_slot text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean;
begin
  if p_slot not in ('midday', 'end_of_day') then
    return false;
  end if;

  insert into public.auto_sync_runs as runs (
    user_id, local_date, slot, status
  ) values (
    p_user_id, p_local_date, p_slot, 'running'
  )
  on conflict (user_id, local_date, slot) do update
    set status = 'running',
        started_at = now(),
        completed_at = null,
        attempt_count = runs.attempt_count + 1,
        error = null
    where runs.status = 'failed'
       or (runs.status = 'running' and runs.started_at < now() - interval '10 minutes')
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

revoke all on function public.claim_auto_sync(uuid, date, text) from public;
revoke all on function public.claim_auto_sync(uuid, date, text) from anon;
revoke all on function public.claim_auto_sync(uuid, date, text) from authenticated;
grant execute on function public.claim_auto_sync(uuid, date, text) to service_role;
