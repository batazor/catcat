drop function public.submit_saturday_plan(jsonb);

grant insert (
  id, window_start, window_end, time_zone, destination, selections,
  plan, plan_text, offer_accepted, offer_version
) on public.saturday_plans to anon;

create policy submit_plan on public.saturday_plans for insert to anon
with check (offer_accepted and offer_version = '2026-11-06');
