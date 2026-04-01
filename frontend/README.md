# Frontend — Portfolio Website

Next.js frontend for [thangle.me](https://thangle.me), including the landing experience and dashboard UI.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger
- Lenis smooth scrolling

## Key Features

- Horizontal section-based portfolio layout (desktop)
- Responsive mobile/desktop behavior
- Interactive navbar elements and custom motion
- Dashboard UI for managing portfolio content
- Contact section with EmailJS form integration

## Run Locally

From repo root:

```bash
pnpm install
pnpm --filter ./frontend dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Environment Variables

Set in `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

## Typecheck

```bash
pnpm --filter ./frontend exec tsc -p tsconfig.json --noEmit
```
