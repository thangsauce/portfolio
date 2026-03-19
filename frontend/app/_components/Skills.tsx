'use client';
import SectionTitle from '@/components/SectionTitle';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useRef } from 'react';
import { MY_STACK } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Category = 'frontend' | 'backend' | 'database' | 'tools';
const CATEGORY_ORDER: Category[] = ['frontend', 'backend', 'database', 'tools'];

const Skills = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const slideUpEl = containerRef.current?.querySelectorAll('.slide-up');
            if (!slideUpEl?.length) return;
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
        { scope: containerRef },
    );

    const entries = CATEGORY_ORDER
        .filter((cat) => MY_STACK[cat].length > 0)
        .map((cat) => [cat, MY_STACK[cat]] as [Category, typeof MY_STACK[Category][number][]]);

    return (
        <section id="my-stack" ref={containerRef}>
            <div className="container">
                <SectionTitle title="My Stack" />

                <div className="space-y-20">
                    {entries.map(([category, items]) => (
                        <div className="grid sm:grid-cols-12" key={category}>
                            <div className="sm:col-span-5">
                                <p className="slide-up text-5xl font-anton leading-none text-muted-foreground uppercase">
                                    {category}
                                </p>
                            </div>
                            <div className="sm:col-span-7 flex gap-x-11 gap-y-9 flex-wrap">
                                {items.map((item, idx) => (
                                    <div className="slide-up flex gap-3.5 items-center leading-none" key={idx}>
                                        {item.icon && (
                                            <div>
                                                <Image
                                                    src={item.icon}
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
