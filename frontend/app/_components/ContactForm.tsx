'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { FormEvent, useRef, useState } from 'react';
import { GENERAL_INFO } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ContactSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
        null,
    );

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

    useGSAP(
        () => {
            const isHorizontalMode = window.innerWidth >= 1024 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from(containerRef.current, {
                    opacity: 0,
                    y: 60,
                    ease: 'power2.out',
                    duration: 0.9,
                });
                return;
            }
            gsap.from(containerRef.current, {
                opacity: 0,
                y: 60,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                },
            });
        },
        { scope: containerRef },
    );

    return (
        <section className="py-24" id="contact" ref={containerRef}>
            <div className="container">
                <div className="max-w-2xl">
                    <p className="text-sm uppercase tracking-widest text-muted-foreground/60 mb-3">Get In Touch</p>
                    <h2 className="text-4xl md:text-5xl font-anton leading-none mb-10">
                        Let&apos;s <span className="text-primary">Connect</span>
                    </h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href={`mailto:${GENERAL_INFO.email}`}
                            className="group relative flex-1 flex flex-col items-center justify-center gap-3 px-6 py-6 rounded-xl border border-border bg-background-light overflow-hidden hover:border-primary/60 transition-all duration-300 text-center"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                </svg>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-0.5">Email</span>
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

                        <form
                            onSubmit={handleEmailJsSubmit}
                            className="relative flex flex-col gap-3 px-4 py-4 rounded-xl border border-border bg-background-light"
                        >
                            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest text-center">
                                Questions or connect
                            </p>

                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/60"
                            />

                            <input
                                type="email"
                                placeholder="Root@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/60"
                            />

                            <textarea
                                placeholder="Leave a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/60 resize-none"
                            />

                            <button
                                type="submit"
                                disabled={sending}
                                className="h-10 px-4 rounded-md border border-primary/40 text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors text-sm uppercase tracking-wider"
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
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function ContactForm() { return null; }
