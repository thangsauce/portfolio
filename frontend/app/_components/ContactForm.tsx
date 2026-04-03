'use client';

import { FormEvent, useRef, useState } from 'react';
import { GENERAL_INFO } from '@/lib/data';
import { useLenis } from 'lenis/react';
import { usePathname, useRouter } from 'next/navigation';

export function ContactSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const router = useRouter();
    const pathname = usePathname();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
        null,
    );
    const PENDING_HASH_KEY = 'pending-home-hash';

    const scrollToY = (y: number) => {
        if (lenis) {
            lenis.scrollTo(y, { duration: 1.05 });
            return;
        }
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const scrollToElement = (target: HTMLElement) => {
        if (lenis) {
            lenis.scrollTo(target, { duration: 1.05 });
            return;
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToHash = (hash: string) => {
        const target = document.querySelector(hash) as HTMLElement | null;
        if (!target) return;

        const isHorizontalMode =
            window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');

        if (isHorizontalMode) {
            const root = document.querySelector('.horizontal-mode') as HTMLElement | null;
            const track = root?.firstElementChild as HTMLElement | null;
            const panel = target.closest('.horizontal-panel') as HTMLElement | null;
            if (!root || !track || !panel) {
                setTimeout(() => scrollToElement(target), 120);
                return;
            }

            const horizontalDistance = Math.max(0, track.scrollWidth - window.innerWidth);
            const rootTop = root.getBoundingClientRect().top + window.scrollY;
            const panelRect = panel.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const sectionOffsetInsidePanel = Math.max(0, targetRect.left - panelRect.left);
            const targetOffset = panel.offsetLeft + sectionOffsetInsidePanel;
            const panelOffset = Math.max(0, Math.min(horizontalDistance, targetOffset));
            const targetY = rootTop + panelOffset;
            setTimeout(() => scrollToY(targetY), 120);
            return;
        }

        setTimeout(() => scrollToElement(target), 120);
    };

    const navigateTo = (url: string) => {
        if (url === '/') {
            if (pathname === '/') {
                setTimeout(() => scrollToY(0), 120);
            } else {
                router.push('/');
            }
            return;
        }

        if (!url.startsWith('/#')) {
            router.push(url);
            return;
        }

        const hash = url.slice(1);
        if (pathname !== '/') {
            window.sessionStorage.setItem(PENDING_HASH_KEY, hash);
            router.push('/');
            return;
        }
        scrollToHash(hash);
    };

    async function handleEmailJsSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus({ ok: false, msg: 'Please fill in all fields.' });
            return;
        }

        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            setStatus({
                ok: false,
                msg: 'EmailJS is not configured yet. Add env keys first.',
            });
            return;
        }

        setSending(true);
        setStatus(null);
        try {
            const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: publicKey,
                    template_params: {
                        to_name: 'Thang Le',
                        to_email: GENERAL_INFO.email,
                        from_name: name,
                        from_email: email,
                        reply_to: email,
                        subject: 'New portfolio contact form message',
                        message,
                    },
                }),
            });

            if (!res.ok) {
                throw new Error(`EmailJS error ${res.status}`);
            }

            setStatus({ ok: true, msg: 'Message sent in real time.' });
            setName('');
            setEmail('');
            setMessage('');
        } catch {
            setStatus({
                ok: false,
                msg: 'Failed to send. Please try again in a moment.',
            });
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <section className="relative pt-16 pb-24 md:pt-28 md:pb-24" id="contact" ref={containerRef}>
            <div className="container">
                <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-anton leading-none mb-10">
                        Let&apos;s <span className="text-primary [[data-theme='light']_&]:text-zinc-500">Connect</span>
                    </h2>
                    <div className="flex flex-col gap-4">
                        <form
                            onSubmit={handleEmailJsSubmit}
                            className="order-2 relative flex flex-col gap-3 px-4 py-4 rounded-xl border border-border [[data-theme='light']_&]:border-foreground/30 bg-background-light"
                        >
                            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest text-center">
                                Questions or connect
                            </p>

                            <label htmlFor="contact-name" className="sr-only">
                                Name
                            </label>
                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                                tabIndex={1}
                                className="h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/60"
                            />

                            <label htmlFor="contact-email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                placeholder="Root@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                inputMode="email"
                                required
                                tabIndex={2}
                                className="h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/60"
                            />

                            <label htmlFor="contact-message" className="sr-only">
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                placeholder="Leave a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                required
                                tabIndex={3}
                                className="px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/60 resize-none"
                            />

                            <button
                                type="submit"
                                disabled={sending}
                                tabIndex={4}
                                className="h-10 px-4 rounded-md border border-primary/40 text-primary [[data-theme='light']_&]:border-foreground/55 [[data-theme='light']_&]:text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 [[data-theme='light']_&]:hover:bg-foreground/8 transition-colors text-sm uppercase tracking-wider"
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>

                            {status && (
                                <p
                                    className={`text-xs ${
                                        status.ok
                                            ? 'text-primary'
                                            : 'text-red-400'
                                    }`}
                                >
                                    {status.msg}
                                </p>
                            )}
                        </form>

                        <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href={GENERAL_INFO.githubProfile}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative flex-1 flex flex-col items-center justify-center gap-3 px-6 py-6 rounded-xl border border-border [[data-theme='light']_&]:border-foreground/30 bg-background-light overflow-hidden hover:border-primary/60 [[data-theme='light']_&]:hover:border-foreground/55 transition-all duration-300 text-center"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="size-12 rounded-full bg-primary/10 [[data-theme='light']_&]:bg-foreground/10 flex items-center justify-center group-hover:bg-primary/20 [[data-theme='light']_&]:group-hover:bg-foreground/20 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary [[data-theme='light']_&]:text-foreground">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-0.5">GitHub</span>
                            </div>
                        </a>
                        <a
                            href={GENERAL_INFO.linkedinProfile}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative flex-1 flex flex-col items-center justify-center gap-3 px-6 py-6 rounded-xl border border-border bg-background-light overflow-hidden hover:border-blue-500/60 transition-all duration-300 text-center"
                        >
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-0.5">LinkedIn</span>
                            </div>
                        </a>
                        </div>
                    </div>
                </div>
            </div>
            </section>
            <footer
                className="relative overflow-hidden border-t border-primary/20 bg-gradient-to-b from-background/95 via-background/85 to-background/95"
                itemScope
                itemType="https://schema.org/Person"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                <div className="pointer-events-none absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

                <div className="container py-6">
                    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-sm sm:px-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="relative inline-flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/80 opacity-70" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                            </span>
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground" itemProp="name">
                                © {new Date().getFullYear()} Thang Le
                            </p>
                        </div>

                        <nav
                            aria-label="Footer links"
                            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                        >
                            <button type="button" onClick={() => navigateTo('/#banner')} className="hover:text-foreground transition-colors">Home</button>
                            <button type="button" onClick={() => navigateTo('/#about-me')} className="hover:text-foreground transition-colors">About Me</button>
                            <button type="button" onClick={() => navigateTo('/#currently-using')} className="hover:text-foreground transition-colors">Currently Using</button>
                            <button type="button" onClick={() => navigateTo('/#selected-projects')} className="hover:text-foreground transition-colors">Projects</button>
                            <button type="button" onClick={() => navigateTo('/#my-experience')} className="hover:text-foreground transition-colors">Experience</button>
                            <button type="button" onClick={() => navigateTo('/#my-stack')} className="hover:text-foreground transition-colors">My Stack</button>
                            <button type="button" onClick={() => navigateTo('/#certifications')} className="hover:text-foreground transition-colors">Certifications</button>
                            <button type="button" onClick={() => navigateTo('/#contact')} className="hover:text-foreground transition-colors">Contact</button>
                            <button type="button" onClick={() => navigateTo('/blog')} className="hover:text-foreground transition-colors">Blog</button>
                        </nav>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            <address className="not-italic text-foreground/85" itemProp="address">
                                Based in Orlando, FL
                            </address>
                            <a
                                href={`mailto:${GENERAL_INFO.email}`}
                                className="hover:text-foreground transition-colors"
                                itemProp="email"
                            >
                                {GENERAL_INFO.email}
                            </a>
                            <a
                                href={GENERAL_INFO.githubProfile}
                                target="_blank"
                                rel="noopener noreferrer me"
                                className="hover:text-foreground transition-colors"
                                itemProp="sameAs"
                            >
                                GitHub
                            </a>
                            <a
                                href={GENERAL_INFO.linkedinProfile}
                                target="_blank"
                                rel="noopener noreferrer me"
                                className="hover:text-foreground transition-colors"
                                itemProp="sameAs"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default function ContactForm() { return null; }
