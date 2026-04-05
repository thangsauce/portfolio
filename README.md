# Thang Le Portfolio

Personal website + CMS dashboard + API backend.

- Site: [https://thangle.me](https://thangle.me)
- API: [https://api.thangle.me](https://api.thangle.me)

## Monorepo

```text
portfolio/
├── frontend/          # Next.js app (landing, projects, blog, dashboard)
├── worker/            # Cloudflare Worker API (public + private routes)
├── supabase/          # SQL migrations / seed data
├── .github/workflows/ # CI/CD
└── pnpm-workspace.yaml
```

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, GSAP, Lenis
- API: Cloudflare Workers + Hono + Zod
- Database/Auth: Supabase (Postgres + Auth)
- Contact: EmailJS
- Package manager: pnpm workspaces

## Install

```bash
pnpm install
```

## Local Development

Run frontend:

```bash
pnpm -C frontend dev
```

Run worker API:

```bash
pnpm -C worker dev
```

## Build / Typecheck

Frontend build:

```bash
pnpm -C frontend build
```

Frontend typecheck:

```bash
pnpm -C frontend exec tsc --noEmit
```

Worker deploy build step (via Wrangler):

```bash
pnpm -C worker run deploy
```

## Environment

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

### Worker (Wrangler vars/secrets)

- `ENVIRONMENT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Main Features

- Desktop horizontal-scroll portfolio with panel transitions/parallax
- Mobile-specific layout and motion behavior
- Sprite-based keyboard character interactions
- API-backed portfolio sections (projects, experience, certifications, skills, resume)
- Dashboard CMS for portfolio/blog/notes/todos/learning/documents
- Auth-protected private API routes for dashboard data
- Contact form with EmailJS

## Deployment Notes

- Frontend and Worker deploy separately.
- Worker is deployed with Wrangler from `worker/`.
- If dashboard data fails in production, check:
  1. Worker secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
  2. CORS origin config in `worker/src/index.ts`
  3. Supabase schema/migrations in `supabase/migrations/`
