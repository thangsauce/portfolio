# My Portfolio Website

A full-stack personal developer portfolio built to showcase my skills, experience, and projects.

Live at: [thangle.me](https://thangle.me)

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, GSAP, Lenis
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Deployment:** Oracle Cloud VPS, Nginx, PM2, Cloudflare

## Features

- Smooth scroll animations powered by GSAP and Lenis
- Fully responsive design across all screen sizes
- Dark/light mode with custom cursor and particle background
- Admin dashboard for managing projects, skills, certifications, and experience
- Contact form with email integration

## Installation & Set Up

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## EmailJS Setup

Create `frontend/.env.local` using `frontend/.env.example` and set:

- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

In EmailJS template params, include at least:

- `to_name`
- `to_email`
- `from_name`
- `from_email`
- `reply_to`
- `subject`
- `message`
