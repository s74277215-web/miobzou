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
