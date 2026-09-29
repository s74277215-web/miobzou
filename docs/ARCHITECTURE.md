# Miobzou architecture

Miobzou is an AI-assisted revenue workspace for a web agency. It is intentionally independent from every other repository.

## Layers

1. **Presentation** — Next.js App Router UI.
2. **Domain** — lead/message types, qualification and handoff policy.
3. **AI gateway** — one server-side adapter supporting OpenAI, Anthropic or a custom webhook.
4. **Automation** — qualification, drafting, outreach and handoff endpoints.
5. **Audit** — immutable-in-process event trail for autonomous actions.
6. **Integration boundary** — outbound webhooks for WhatsApp/CRM/notification providers without coupling the core domain to a vendor.

## Runtime flow

Discovery source → prospect record → enrichment → AI personalization → compliant outreach → conversation → extraction/scoring → qualified lead → human handoff → human pricing/payment.

The system never puts provider secrets in client code. Channel providers are deliberately injected through server-side webhooks so the same core can work with a compliant WhatsApp, email, CRM or orchestration service.

## Production persistence

The domain is adapter-based. For a multi-user deployment, replace the in-process audit/lead stores with PostgreSQL (or another durable store), add authentication/authorization, encryption at rest, job queues, idempotency keys and provider-specific consent/suppression storage.
