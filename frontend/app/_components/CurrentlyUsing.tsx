'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useRef, useEffect, useState } from 'react';
import { getCurrentlyUsing } from '@/lib/portfolioPrefetch';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Skill = { id: string; name: string; icon_url?: string | null }

function shouldInvertIconInDarkMode(name: string): boolean {
    const normalized = name.trim().toLowerCase();
    return normalized === 'zed' || normalized === 'notion';
}

const CurrentlyUsing = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            const data = await getCurrentlyUsing();
            if (alive) setSkills(data);
        };
        void load();
        return () => {
            alive = false;
        };
    }, []);

    useGSAP(
        () => {
            if (skills.length === 0) return;
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from('.it-skill-item', {
                    opacity: 0,
                    y: 24,
                    stagger: 0.15,
                    ease: 'power2.out',
                    duration: 0.8,
                });
                return;
            }
            gsap.from('.it-skill-item', {
                opacity: 0,
                y: 24,
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
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) return;
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

    return (
        <section className="pt-0 pb-section" id="currently-using" ref={containerRef}>
            <div className="container">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary [[data-theme='light']_&]:text-foreground/80 font-mono text-xl leading-none select-none">&lt;</span>
                    <h2 className="text-xl uppercase leading-none tracking-widest">CURRENTLY USING</h2>
                    <span className="text-primary [[data-theme='light']_&]:text-foreground/80 font-mono text-xl leading-none select-none">&gt;</span>
                </div>

                {skills.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 items-start justify-items-start">
                        {skills.map((skill) => (
                            <div
                                key={skill.id}
                                className="it-skill-item flex items-center gap-2.5 leading-none min-w-0 w-full"
                            >
                                <div className="w-8 h-8 shrink-0 flex items-center justify-start">
                                    {skill.icon_url ? (
                                        <Image
                                            src={skill.icon_url}
                                            alt={skill.name}
                                            width={40}
                                            height={40}
                                            className={`w-8 h-8 object-contain object-left ${shouldInvertIconInDarkMode(skill.name) ? 'dark:brightness-0 dark:invert' : ''}`}
                                        />
                                    ) : null}
                                </div>
                                <span className="text-xl capitalize break-words">{skill.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-base">No currently using items yet.</p>
                )}
            </div>
        </section>
    );
};

export default CurrentlyUsing;
