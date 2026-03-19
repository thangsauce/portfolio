'use client';
import SectionTitle from '@/components/SectionTitle';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React, { useRef } from 'react';
import { CERTIFICATIONS } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Certifications = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (CERTIFICATIONS.length === 0) return;
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
        { scope: containerRef },
    );

    if (CERTIFICATIONS.length === 0) return null;

    return (
        <section className="py-12" id="certifications" ref={containerRef}>
            <div className="container">
                <SectionTitle title="Certifications" />

                <div className="space-y-4 max-w-2xl">
                    {CERTIFICATIONS.map((cert) => (
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
                                        {cert.issuer}{cert.cert_id ? ` · ID: ${cert.cert_id}` : ''}
                                    </p>
                                </div>
                                {cert.date && (
                                    <span className="text-primary font-mono text-sm shrink-0 ml-4">{cert.date}</span>
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
                                        {cert.issuer}{cert.cert_id ? ` · ID: ${cert.cert_id}` : ''}
                                    </p>
                                </div>
                                {cert.date && (
                                    <span className="text-primary font-mono text-sm shrink-0 ml-4">{cert.date}</span>
                                )}
                            </div>
                        )
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Certifications;
