'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useRef } from 'react';
import { GENERAL_INFO } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ContactSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
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
                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{GENERAL_INFO.email}</span>
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
                                <span className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors duration-300">thang-le-it</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function ContactForm() { return null; }
