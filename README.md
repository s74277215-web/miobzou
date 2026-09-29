# Miobzou

AI Revenue Operating System for a web agency.

## What is included

- Prospect CRM with intent scoring and pipeline stages
- AI inbox / conversation workspace
- Qualification fields: need, budget, role, channel
- Explicit human-handoff boundary before pricing/payment
- Provider configuration surface for OpenAI, Anthropic or a custom webhook
- Responsive premium dashboard
- Activity and audit-oriented data model
- No dependency on the user's other repositories

## Architecture

The application is intentionally split into domain types, state/seed data, UI and the future server-side AI adapter layer.

### Production AI adapter

Do **not** put provider API keys in browser code. Connect the Settings surface to a server-side route or secret-managed deployment and implement:

1. Prospect discovery adapter
2. Website/company enrichment adapter
3. AI conversation adapter
4. Lead qualification / scoring adapter
5. Handoff notification adapter
6. Audit event persistence

The hard business boundary is: AI may prospect and qualify, but a human takes over before payment, contract acceptance or any irreversible commercial action.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
