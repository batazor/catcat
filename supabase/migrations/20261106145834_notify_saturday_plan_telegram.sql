-- Configure saturday_telegram_bot_token and saturday_telegram_chat_id in Vault.
-- Secret values are deliberately absent from this migration and the website.
create extension if not exists pg_net with schema extensions;

create schema if not exists saturday_private;
revoke all on schema saturday_private from public, anon, authenticated;

create or replace function saturday_private.notify_saturday_plan_telegram()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bot_token text;
  chat_id text;
begin
  select decrypted_secret into bot_token
    from vault.decrypted_secrets where name = 'saturday_telegram_bot_token';
  select decrypted_secret into chat_id
    from vault.decrypted_secrets where name = 'saturday_telegram_chat_id';

  if bot_token is null or chat_id is null then
    return new;
  end if;

  -- The HTTP request starts after commit, once the plan is saved.
  perform net.http_post(
    url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object(
      'chat_id', chat_id,
      'text', left(new.plan_text, 4000),
      'link_preview_options', jsonb_build_object('is_disabled', true)
    ),
    timeout_milliseconds := 10000
  );
  return new;
exception when others then
  -- Notification failure must never prevent the plan from being saved.
  -- Do not log SQLERRM: an HTTP error may include the URL with the bot token.
  raise warning 'Saturday Telegram notification could not be queued';
  return new;
end;
$$;

revoke all on function saturday_private.notify_saturday_plan_telegram()
  from public, anon, authenticated;

create trigger notify_saturday_plan_telegram
  after insert on public.saturday_plans
  for each row execute function saturday_private.notify_saturday_plan_telegram();
