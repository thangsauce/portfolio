'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useRef } from 'react';

gsap.registerPlugin(useGSAP);

const Preloader = () => {
    const preloaderRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
            });

            tl.from('.preloader-glyph-part', {
                yPercent: 80,
                opacity: 0,
                stagger: 0.08,
                duration: 0.5,
                ease: 'power3.out',
            })
                .fromTo(
                    '.preloader-glyph',
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
                .to('.preloader-glyph-wrap', { y: -22, opacity: 0, duration: 0.35 }, '+=0.2')
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
            <div className="preloader-glyph-wrap -mt-12 md:-mt-16">
                <svg
                    className="preloader-glyph w-[140px] h-[140px] md:w-[170px] md:h-[170px] text-primary"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Thang Le monogram"
                >
                    <path
                        className="preloader-glyph-part"
                        d="M18 24H102"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        className="preloader-glyph-part"
                        d="M60 24V96"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        className="preloader-glyph-part"
                        d="M60 96H100"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        className="preloader-glyph-part"
                        d="M20 58C20 42 34 30 50 30"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <circle
                        className="preloader-glyph-part"
                        cx="20"
                        cy="58"
                        r="5"
                        fill="currentColor"
                    />
                </svg>
            </div>
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
