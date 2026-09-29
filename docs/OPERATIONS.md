# Miobzou Operations

Flow: Research -> prospect -> consent/suppression -> outreach -> webhook reply -> AI extraction/scoring -> human handoff.

Required server secrets: DATABASE_URL, OPENAI_API_KEY (or another AI provider), AUTOMATION_SECRET. WhatsApp requires META_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID and META_VERIFY_TOKEN. Instagram uses the configured inbound webhook and a provider-specific send adapter. Email uses OUTREACH_WEBHOOK_URL plus the inbound provider webhook.

Configure a managed PostgreSQL database and run the app with server-side secrets only. Point Meta/provider webhooks to the webhook routes in this project. Configure a scheduler/cron to POST /api/automation/run with Authorization: Bearer $AUTOMATION_SECRET.

The agent can research, personalize, qualify and prepare follow-ups, but never accepts payment, signs contracts or makes irreversible commercial commitments. Maintain opt-out/suppression records and obey provider messaging policies. Dashboard authentication is still required before public production exposure.
