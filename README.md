# Miobzou

AI Revenue Operating System for a web agency.

## Included

- Premium responsive command center
- Prospect pipeline with qualification and intent scoring
- AI inbox connected to a server-side provider gateway
- OpenAI / Anthropic / custom webhook adapter
- AI extraction endpoint for structured qualification
- Handoff endpoint with a hard pre-payment boundary
- Outreach webhook adapter with suppression and per-recipient rate limiting
- Audit event endpoint
- Security and architecture documentation
- No dependency on the user's other repositories

## Runtime

1. Put provider credentials in environment variables; never in browser code.
2. Start the app with `npm install && npm run dev`.
3. Configure `AI_PROVIDER` and the matching secret.
4. Configure `OUTREACH_WEBHOOK_URL` only when a compliant channel/automation provider is ready.
5. Keep human approval as the final step for pricing, contracts and payment.

## Important production hardening

The core architecture is ready for integration, but a real multi-user deployment still needs durable PostgreSQL storage, authentication/authorization, encrypted secrets, background job queues, provider-specific consent/suppression handling and observability. Those are infrastructure concerns rather than browser UI features and should not be faked with local state.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [SECURITY.md](SECURITY.md).


## Production close-out

The app now includes:
- private dashboard authentication via `DASHBOARD_PASSWORD`;
- PostgreSQL-backed leads, messages, jobs, events and suppressions;
- authenticated lead/message/notification API routes;
- inbound AI qualification and human handoff before payment/contract;
- outbound quiet hours, opt-out suppression, recipient rate limits and minimum delay;
- automation locking with retry/backoff;
- Meta/WhatsApp webhook ingestion and provider adapters.

### Required deployment variables
Set `DASHBOARD_PASSWORD`, `DATABASE_URL`, `OPENAI_API_KEY` and `AUTOMATION_SECRET` in the hosting environment. Add Meta/WhatsApp, Instagram and email credentials only for channels you actually connect.

### Final external setup
1. Deploy the Next.js app over HTTPS.
2. Create a managed PostgreSQL database and set `DATABASE_URL`.
3. Set a strong `DASHBOARD_PASSWORD`; never commit it.
4. Set `OPENAI_API_KEY` and the selected model.
5. Configure Meta webhooks/WhatsApp credentials if WhatsApp is enabled.
6. Configure the Instagram/email provider adapter if those channels are enabled.
7. Schedule authenticated POST requests to `/api/automation/run` every few minutes with `Authorization: Bearer <AUTOMATION_SECRET>`.
8. Verify the production health endpoints and then start with a small, consent-aware outreach volume.

The application does not perform payment or contract actions automatically; commercial commitment remains a human step.
