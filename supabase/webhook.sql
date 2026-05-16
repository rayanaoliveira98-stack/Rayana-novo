-- Run AFTER deploying the Edge Function.
-- Replace <PROJECT_REF> with your Supabase project ref (e.g. abcdefghijklmnop).
-- Replace <WEBHOOK_SECRET> with a random string you also set in the function env vars.

select supabase_functions.http_request(
  'https://<PROJECT_REF>.supabase.co/functions/v1/notify-new-lead',
  'POST',
  '{"Content-Type":"application/json","x-webhook-secret":"<WEBHOOK_SECRET>"}',
  '{}',
  '1000'
);

-- OR use the Supabase Dashboard UI (recommended for beginners):
-- Database → Webhooks → Create a new hook
--   Table:  partner_leads
--   Events: INSERT
--   URL:    https://<PROJECT_REF>.supabase.co/functions/v1/notify-new-lead
--   HTTP Headers:
--     Content-Type: application/json
--     x-webhook-secret: <WEBHOOK_SECRET>
