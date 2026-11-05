alter table public.saturday_plans
  add column client_info jsonb not null default '{}'::jsonb
  check (jsonb_typeof(client_info) = 'object' and octet_length(client_info::text) <= 4096);

grant insert (client_info) on public.saturday_plans to anon;

comment on column public.saturday_plans.client_info is 'Browser-reported device hints collected on plan submission; not verified identity or bot detection.';
notify pgrst, 'reload schema';
