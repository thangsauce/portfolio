'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useRef, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Experience = {
    id: string;
    company: string;
    role: string;
    description: string[] | null;
    start_date: string | null;
    end_date: string | null;
    order_index: number;
}

function formatDuration(start: string | null, end: string | null): string {
    if (!start) return '';
    const startYear = new Date(start).getFullYear();
    const endStr = end ? new Date(end).getFullYear().toString() : 'Present';
    return `${startYear} – ${endStr}`;
}

const Experiences = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);

    useEffect(() => {
        apiFetch<Experience[]>('/api/portfolio/experiences')
            .then(setExperiences)
            .catch(() => {});
    }, []);

    useGSAP(
        () => {
            if (experiences.length === 0) return;
            const isHorizontalMode = window.innerWidth >= 1024 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from('.experience-item', {
                    y: 50,
                    opacity: 0,
                    stagger: 0.2,
                    ease: 'power2.out',
                    duration: 0.9,
                });
                return;
            }
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 60%',
                    end: 'bottom 50%',
                    toggleActions: 'restart none none reverse',
                    scrub: 1,
                },
            });
            tl.from('.experience-item', { y: 50, opacity: 0, stagger: 0.3 });
        },
        { scope: containerRef, dependencies: [experiences.length] },
    );

    useGSAP(
        () => {
            const isHorizontalMode = window.innerWidth >= 1024 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) return;
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'bottom 50%',
                    end: 'bottom 20%',
                    scrub: 1,
                },
            });
            tl.to(containerRef.current, { y: -150, opacity: 0 });
        },
        { scope: containerRef },
    );

    if (experiences.length === 0) return null;

    return (
        <section className="mt-4 md:mt-8 pb-section" id="my-experience">
            <div className="container" ref={containerRef}>
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
                    <h2 className="text-xl uppercase leading-none tracking-widest">
                        MY EXPERIENCE
                    </h2>
                    <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
                </div>

                <div className="grid gap-14">
                    {experiences.map((item) => (
                        <div key={item.id} className="experience-item">
                            <p className="text-xl text-muted-foreground">{item.company}</p>
                            <p className="text-5xl font-anton leading-none mt-3.5 mb-2.5">{item.role}</p>
                            <p className="text-lg text-muted-foreground">{formatDuration(item.start_date, item.end_date)}</p>
                            {!!item.description?.length && (
                                <ul className="mt-4 space-y-2 text-sm md:text-base text-muted-foreground max-w-3xl">
                                    {item.description.map((line, idx) => (
                                        <li key={`${item.id}-${idx}`} className="leading-relaxed">
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experiences;
