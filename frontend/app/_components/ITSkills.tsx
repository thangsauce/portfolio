'use client';
import SectionTitle from '@/components/SectionTitle';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React, { useRef } from 'react';
import { IT_SKILLS } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITSkills = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (IT_SKILLS.length === 0) return;
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
        { scope: containerRef },
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

    if (IT_SKILLS.length === 0) return null;

    return (
        <section className="py-12" id="it-skills" ref={containerRef}>
            <div className="container">
                <SectionTitle title="IT Skills" />

                <ul className="space-y-4 max-w-2xl">
                    {IT_SKILLS.map((skill) => (
                        <li
                            key={skill.id}
                            className="it-skill-item flex items-start gap-3 text-muted-foreground"
                        >
                            <span className="text-primary font-mono mt-[2px] shrink-0">▹</span>
                            <span className="text-lg leading-snug">{skill.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default ITSkills;
