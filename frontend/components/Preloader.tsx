'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useRef } from 'react';

gsap.registerPlugin(useGSAP);

const Preloader = () => {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const name = 'Thang Le';

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
            });

            tl.from('.preloader-char', {
                yPercent: 120,
                opacity: 0,
                stagger: 0.06,
                duration: 0.55,
                ease: 'power3.out',
            })
                .fromTo(
                    '.preloader-name',
                    { filter: 'blur(8px)' },
                    { filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' },
                    '<',
                )
                .to(
                    '.preloader-bar-fill',
                    { scaleX: 1, duration: 1.1, ease: 'power2.inOut' },
                    '-=0.15',
                )
                .to('.preloader-orbit', {
                    rotate: 360,
                    transformOrigin: '50% 50%',
                    duration: 1,
                    ease: 'none',
                }, '<')
                .to('.preloader-name', { y: -22, opacity: 0, duration: 0.35 }, '+=0.2')
                .to('.preloader-bar', { opacity: 0, duration: 0.25 }, '<')
                .to('.preloader-orbit', { opacity: 0, duration: 0.2 }, '<')
                .to(preloaderRef.current, { opacity: 0, duration: 0.4 })
                .set(preloaderRef.current, { display: 'none' });
        },
        { scope: preloaderRef },
    );

    return (
        <div
            ref={preloaderRef}
            className="fixed inset-0 z-[6] bg-background flex flex-col items-center justify-center"
        >
            <p className="preloader-name -mt-12 md:-mt-16 font-anton text-[12vw] md:text-[9vw] lg:text-[120px] leading-none text-primary whitespace-nowrap">
                {name.split('').map((char, idx) => (
                    <span
                        key={`${char}-${idx}`}
                        className={`preloader-char inline-block ${char === ' ' ? 'w-[0.32em]' : ''}`}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                ))}
            </p>
            <div className="preloader-bar relative mt-64 md:mt-72 w-44 h-[3px] bg-background-light/60 overflow-hidden rounded-full">
                <div className="preloader-bar-fill absolute inset-0 bg-primary/90 rounded-full origin-left scale-x-0"></div>
            </div>
            <div className="preloader-orbit pointer-events-none absolute mt-64 md:mt-72 w-24 h-24">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 size-2 rounded-full bg-primary/70" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-primary/45" />
            </div>
        </div>
    );
};

export default Preloader;
