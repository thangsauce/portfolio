'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useRef, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Skill = { id: string; name: string; category: string; icon_url: string | null }
const PREFERRED_CATEGORY_ORDER = ['frontend', 'backend', 'database', 'tools']

function normalizeSkillCategory(value: string): string {
    const normalized = value.toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (!normalized) return '';
    if (normalized === 'front_end' || normalized === 'frontend_dev' || normalized === 'web') return 'frontend';
    if (normalized === 'back_end' || normalized === 'backend_dev') return 'backend';
    if (normalized === 'tool' || normalized === 'tooling') return 'tools';
    if (normalized === 'db' || normalized === 'data') return 'database';
    if (normalized === 'itsupport' || normalized === 'it_skills' || normalized === 'it') return 'it_support';
    return normalized;
}

function formatCategoryLabel(category: string): string {
    if (category === 'it_support') return 'it support';
    return category.replace(/_/g, ' ');
}

const Skills = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        apiFetch<Skill[]>('/api/portfolio/stacks')
            .then((data) =>
                setSkills(
                    data.map((item) => ({
                        ...item,
                        category: normalizeSkillCategory(item.category),
                    })),
                ),
            )
            .catch(() => {});
    }, []);

    useGSAP(
        () => {
            const slideUpEl = containerRef.current?.querySelectorAll('.slide-up');
            if (!slideUpEl?.length) return;
            const isHorizontalMode = window.innerWidth >= 1024 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from('.slide-up', {
                    opacity: 0,
                    y: 40,
                    ease: 'power2.out',
                    stagger: 0.08,
                    duration: 0.8,
                });
                return;
            }
            gsap.from('.slide-up', {
                opacity: 0,
                y: 40,
                ease: 'power2.out',
                stagger: 0.08,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse',
                },
            });
        },
        { scope: containerRef, dependencies: [skills.length] },
    );

    const grouped = skills.reduce((acc, skill) => {
        const cat = skill.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    const allCategories = Object.keys(grouped);
    const orderedCategories = [
        ...PREFERRED_CATEGORY_ORDER.filter((cat) => allCategories.includes(cat)),
        ...allCategories.filter((cat) => !PREFERRED_CATEGORY_ORDER.includes(cat)),
    ];
    const entries = orderedCategories.map((cat) => [cat, grouped[cat]] as [string, Skill[]]);

    if (skills.length === 0) return null;

    return (
        <section id="my-stack" ref={containerRef}>
            <div className="container">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
                    <h2 className="text-xl uppercase leading-none tracking-widest">
                        MY STACK
                    </h2>
                    <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
                </div>

                <div className="space-y-20">
                    {entries.map(([category, items]) => (
                        <div className="grid sm:grid-cols-12" key={category}>
                            <div className="sm:col-span-5">
                                <p className="slide-up text-5xl font-anton leading-none text-muted-foreground uppercase">
                                    {formatCategoryLabel(category)}
                                </p>
                            </div>
                            <div className="sm:col-span-7 flex gap-x-11 gap-y-9 flex-wrap">
                                {items.map((item) => (
                                    <div className="slide-up flex gap-3.5 items-center leading-none" key={item.id}>
                                        {item.icon_url && (
                                            <div>
                                                <Image
                                                    src={item.icon_url}
                                                    alt={item.name}
                                                    width={40}
                                                    height={40}
                                                    className="max-h-10"
                                                />
                                            </div>
                                        )}
                                        <span className="text-2xl capitalize">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
