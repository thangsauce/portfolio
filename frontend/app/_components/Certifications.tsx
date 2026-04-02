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
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const Certifications = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [certs, setCerts] = useState<Cert[]>([]);

    useEffect(() => {
        apiFetch<Cert[]>('/api/portfolio/certifications')
            .then(setCerts)
            .catch(() => {});
    }, []);

    useGSAP(
        () => {
            if (certs.length === 0) return;
            const isHorizontalMode = window.innerWidth >= 1024 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from('.cert-item', {
                    opacity: 0,
                    y: 30,
                    stagger: 0.15,
                    ease: 'power2.out',
                    duration: 0.8,
                });
                return;
            }
            gsap.from('.cert-item', {
                opacity: 0,
                y: 30,
                stagger: 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                },
            });
        },
        { scope: containerRef, dependencies: [certs.length] },
    );

    if (certs.length === 0) return null;

    return (
        <section className="pt-0 pb-section" id="certifications" ref={containerRef}>
            <div className="container">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
                    <h2 className="text-xl uppercase leading-none tracking-widest">
                        CERTIFICATION
                    </h2>
                    <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
                </div>

                <div className="space-y-4 max-w-2xl">
                    {certs.map((cert) =>
                        cert.url ? (
                            <a
                                key={cert.id}
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cert-item flex items-center justify-between border border-border rounded px-5 py-4 hover:border-primary transition-colors group"
                            >
                                <div>
                                    <p className="text-lg font-medium group-hover:text-primary transition-colors">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {cert.issuer}{cert.credential_id ? ` · ID: ${cert.credential_id}` : ''}
                                    </p>
                                </div>
                                {cert.issue_date && (
                                    <span className="text-primary font-mono text-sm shrink-0 ml-4">{formatDate(cert.issue_date)}</span>
                                )}
                            </a>
                        ) : (
                            <div
                                key={cert.id}
                                className="cert-item flex items-center justify-between border border-border rounded px-5 py-4"
                            >
                                <div>
                                    <p className="text-lg font-medium">{cert.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {cert.issuer}{cert.credential_id ? ` · ID: ${cert.credential_id}` : ''}
                                    </p>
                                </div>
                                {cert.issue_date && (
                                    <span className="text-primary font-mono text-sm shrink-0 ml-4">{formatDate(cert.issue_date)}</span>
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
