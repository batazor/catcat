create table public.saturday_plans (
  id uuid primary key,
  created_at timestamptz not null default now(),
  window_start numeric not null check (window_start between 8 and 23 and mod(window_start, 0.5) = 0),
  window_end numeric not null check (window_end between 8 and 23 and mod(window_end, 0.5) = 0),
  time_zone text not null check (time_zone = 'Asia/Makassar'),
  destination text not null check (destination in ('canggu', 'bukit')),
  selections jsonb not null check (
    jsonb_typeof(selections) = 'object' and octet_length(selections::text) <= 2048
    and selections - array['where', 'short', 'game', 'nature', 'sunset', 'bbeach', 'bsunset'] = '{}'::jsonb
  ),
  plan jsonb not null check (
    jsonb_typeof(plan) = 'array' and jsonb_array_length(plan) between 1 and 8
    and octet_length(plan::text) <= 8192
  ),
  plan_text text not null check (char_length(plan_text) between 1 and 4000),
  offer_accepted boolean not null check (offer_accepted),
  offer_version text not null check (offer_version = '2026-11-06'),
  check (window_end >= window_start + 2)
);

alter table public.saturday_plans enable row level security;
revoke all on table public.saturday_plans from public, anon, authenticated;
grant all on table public.saturday_plans to service_role;

-- Only this write-only function is exposed to the page. No plan-reading endpoint.
create function public.submit_saturday_plan(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission_id uuid;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' or octet_length(payload::text) > 16000 then
    raise exception 'Invalid plan' using errcode = '22023';
  end if;
  submission_id := (payload->>'id')::uuid;
  insert into public.saturday_plans (
    id, window_start, window_end, time_zone, destination, selections,
    plan, plan_text, offer_accepted, offer_version
  ) values (
    submission_id, (payload->>'window_start')::numeric, (payload->>'window_end')::numeric,
    payload->>'time_zone', payload->>'destination', payload->'selections',
    payload->'plan', payload->>'plan_text', (payload->>'offer_accepted')::boolean,
    payload->>'offer_version'
  ) on conflict (id) do nothing;
  return submission_id;
end;
$$;

revoke all on function public.submit_saturday_plan(jsonb) from public, anon, authenticated;
grant execute on function public.submit_saturday_plan(jsonb) to anon;

comment on table public.saturday_plans is 'Plans submitted from ideal-saturday; browser clients cannot read, update or delete them.';
notify pgrst, 'reload schema';
