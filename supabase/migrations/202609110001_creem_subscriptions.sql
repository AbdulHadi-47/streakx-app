create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creem_customer_id text unique,
  creem_subscription_id text unique,
  creem_product_id text,
  billing_interval text check (billing_interval in ('monthly', 'yearly')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_event_id text,
  last_event_created_at bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists subscriptions_access_idx
  on public.subscriptions (status, current_period_end);

create or replace function public.apply_creem_subscription_event(
  p_user_id uuid,
  p_creem_customer_id text,
  p_creem_subscription_id text,
  p_creem_product_id text,
  p_billing_interval text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_event_id text,
  p_event_created_at bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_billing_interval not in ('monthly', 'yearly') then
    raise exception 'Invalid billing interval';
  end if;

  insert into public.subscriptions as subscriptions (
    user_id, creem_customer_id, creem_subscription_id, creem_product_id,
    billing_interval, status, current_period_end, cancel_at_period_end,
    last_event_id, last_event_created_at, updated_at
  ) values (
    p_user_id, p_creem_customer_id, p_creem_subscription_id, p_creem_product_id,
    p_billing_interval, p_status, p_current_period_end, p_cancel_at_period_end,
    p_event_id, p_event_created_at, now()
  )
  on conflict (user_id) do update set
    creem_customer_id = coalesce(excluded.creem_customer_id, subscriptions.creem_customer_id),
    creem_subscription_id = excluded.creem_subscription_id,
    creem_product_id = excluded.creem_product_id,
    billing_interval = excluded.billing_interval,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    last_event_id = excluded.last_event_id,
    last_event_created_at = excluded.last_event_created_at,
    updated_at = now()
  where excluded.last_event_created_at >= subscriptions.last_event_created_at;
end;
$$;

revoke all on function public.apply_creem_subscription_event(uuid, text, text, text, text, text, timestamptz, boolean, text, bigint) from public;
revoke all on function public.apply_creem_subscription_event(uuid, text, text, text, text, text, timestamptz, boolean, text, bigint) from anon;
revoke all on function public.apply_creem_subscription_event(uuid, text, text, text, text, text, timestamptz, boolean, text, bigint) from authenticated;
grant execute on function public.apply_creem_subscription_event(uuid, text, text, text, text, text, timestamptz, boolean, text, bigint) to service_role;
