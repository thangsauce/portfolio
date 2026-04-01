# Thang Le — Portfolio

Personal portfolio and dashboard for Thang Le.

Live site: [thangle.me](https://thangle.me)

## Monorepo Structure

```text
portfolio/
├── frontend/          # Next.js app (UI + dashboard)
├── worker/            # Cloudflare Worker API
├── supabase/          # Supabase config/migrations
├── .github/workflows/ # CI/CD workflows
└── pnpm-workspace.yaml
```

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, GSAP, Lenis
- Backend API: Cloudflare Workers
- Data: Supabase (Postgres + storage)
- Tooling: pnpm workspace
- Deployment: Cloudflare (site + API)

## Local Development

Install dependencies at repo root:

```bash
pnpm install
```

Run frontend:

```bash
pnpm --filter ./frontend dev
```

Run worker API:

```bash
pnpm --filter ./worker dev
```

## Environment Notes

Frontend (`frontend/.env.local`) typically includes:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

Worker runtime uses secrets/vars such as:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Features

- Horizontal-scroll portfolio experience with GSAP transitions/parallax
- Responsive navbar with interactive custom eye icon
- Portfolio dashboard CMS for content management
- Real-time contact form flow via EmailJS
- API-backed sections (projects, skills, certifications, experience, resume)
