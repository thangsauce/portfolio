'use client';
import SectionTitle from '@/components/SectionTitle';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React, { useRef, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Skill = { id: string; name: string; category: string }

const ITSkills = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        apiFetch<Skill[]>('/api/portfolio/skills')
            .then((data) => setSkills(data.filter((s) => s.category === 'it_support')))
            .catch(() => {});
    }, []);

    useGSAP(
        () => {
            if (skills.length === 0) return;
            gsap.from('.it-skill-item', {
                opacity: 0,
                x: -30,
                stagger: 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                },
            });
        },
        { scope: containerRef, dependencies: [skills.length] },
    );

    useGSAP(
        () => {
            gsap.to(containerRef.current, {
                y: -150,
                opacity: 0,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'bottom 50%',
                    end: 'bottom 10%',
                    scrub: 1,
                },
            });
        },
        { scope: containerRef },
    );

    if (skills.length === 0) return null;

    return (
        <section className="py-12" id="it-skills" ref={containerRef}>
            <div className="container">
                <SectionTitle title="IT Skills" />

                <ul className="space-y-4 max-w-2xl">
                    {skills.map((skill) => (
                        <li
                            key={skill.id}
                            className="it-skill-item flex items-start gap-3 text-muted-foreground"
                        >
                            <span className="text-primary font-mono mt-[2px] shrink-0">▹</span>
                            <span className="text-lg leading-snug">{skill.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default ITSkills;
