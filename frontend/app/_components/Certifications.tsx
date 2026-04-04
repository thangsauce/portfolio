'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React, { useRef, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Cert = {
    id: string;
    name: string;
    issuer: string | null;
    issue_date: string | null;
    credential_id: string | null;
    url: string | null;
}

function formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const Certifications = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [certs, setCerts] = useState<Cert[]>([]);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            const endpoints = [
                '/api/portfolio/certifications',
                '/api/portfolio/certification',
            ];

            for (const endpoint of endpoints) {
                try {
                    const data = await apiFetch<Cert[]>(endpoint);
                    if (!alive) return;
                    if (Array.isArray(data)) {
                        setCerts(
                            [...data].sort(
                                (a, b) => ((a as Cert & { order_index?: number }).order_index ?? 0) -
                                    ((b as Cert & { order_index?: number }).order_index ?? 0),
                            ),
                        );
                        setLoadError(false);
                        return;
                    }
                } catch {
                    // Try the next endpoint for compatibility across deployments.
                }
            }

            if (alive) {
                setCerts([]);
                setLoadError(true);
            }
        };

        void load();
        return () => {
            alive = false;
        };
    }, []);

    useGSAP(
        () => {
            if (certs.length === 0) return;
            gsap.set('.cert-item', {
                opacity: 1,
                y: 0,
                clearProps: 'opacity,transform',
            });
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.fromTo(
                    '.cert-item',
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        ease: 'power2.out',
                        duration: 0.8,
                        clearProps: 'opacity,transform',
                    },
                );
                return;
            }
            gsap.fromTo(
                '.cert-item',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    ease: 'power2.out',
                    clearProps: 'opacity,transform',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                },
            );
        },
        { scope: containerRef, dependencies: [certs.length] },
    );

    return (
        <section className="pt-20 md:pt-0 pb-section" id="certifications" ref={containerRef}>
            <div className="container">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary [[data-theme='light']_&]:text-foreground/80 font-mono text-2xl leading-none select-none">&lt;</span>
                    <h2 className="text-2xl uppercase leading-none tracking-widest">
                        CERTIFICATION
                    </h2>
                    <span className="text-primary [[data-theme='light']_&]:text-foreground/80 font-mono text-2xl leading-none select-none">&gt;</span>
                </div>

                <div className="space-y-4 max-w-2xl">
                    {certs.length === 0 && (
                        <div className="cert-item px-0 py-1">
                            <p className="text-sm text-muted-foreground [[data-theme='light']_&]:text-zinc-700">
                                {loadError ? 'Unable to load certifications right now.' : 'No currently certifications items yet.'}
                            </p>
                        </div>
                    )}

                    {certs.map((cert) =>
                        cert.url ? (
                            <a
                                key={cert.id}
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cert-item flex items-center justify-between border border-border rounded px-5 py-4 bg-white/[0.03] backdrop-blur-sm hover:border-white/30 hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] transition-all group [[data-theme='light']_&]:bg-black/[0.03] [[data-theme='light']_&]:hover:border-zinc-500 [[data-theme='light']_&]:hover:bg-black/[0.06]"
                            >
                                <div>
                                    <p className="text-lg font-medium text-foreground transition-colors [[data-theme='light']_&]:text-zinc-900">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground [[data-theme='light']_&]:text-zinc-700">
                                        {cert.issuer}{cert.credential_id ? ` · ID: ${cert.credential_id}` : ''}
                                    </p>
                                </div>
                                {cert.issue_date && (
                                    <span className="text-foreground/85 font-mono text-sm shrink-0 ml-4 [[data-theme='light']_&]:text-zinc-900">{formatDate(cert.issue_date)}</span>
                                )}
                            </a>
                        ) : (
                            <div
                                key={cert.id}
                                className="cert-item flex items-center justify-between border border-border rounded px-5 py-4 bg-white/[0.03] backdrop-blur-sm [[data-theme='light']_&]:bg-black/[0.03]"
                            >
                                <div>
                                    <p className="text-lg font-medium [[data-theme='light']_&]:text-zinc-900">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground [[data-theme='light']_&]:text-zinc-700">
                                        {cert.issuer}{cert.credential_id ? ` · ID: ${cert.credential_id}` : ''}
                                    </p>
                                </div>
                                {cert.issue_date && (
                                    <span className="text-foreground/85 font-mono text-sm shrink-0 ml-4 [[data-theme='light']_&]:text-zinc-900">{formatDate(cert.issue_date)}</span>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

export default Certifications;
