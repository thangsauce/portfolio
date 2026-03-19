# Thang Le — Portfolio

Personal portfolio website for Thang Le, IT Specialist and UCF student.

**Live site:** [thangle.me](https://thangle.me)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | GSAP, Lenis |
| Deployment | Cloudflare Pages via GitHub Actions |

---

## Project Structure

```
portfolio/
├── frontend/          # Next.js app
│   ├── app/           # App router pages & layouts
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React context providers
│   ├── lib/           # Utility functions
│   ├── public/        # Static assets
│   └── types/         # TypeScript type definitions
└── .github/
    └── workflows/     # CI/CD pipeline (deploy.yml)
```

---

## Development

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view locally.

---

## Deployment

Pushing to `main` automatically triggers the GitHub Actions workflow, which:

1. Installs dependencies and runs `next build`
2. Deploys the static output (`frontend/out`) to **Cloudflare Pages**

The site is served at [thangle.me](https://thangle.me).

### Required Secrets

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
