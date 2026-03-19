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

            tl.from('.preloader-initials', {
                scale: 0.6,
                opacity: 0,
                duration: 0.6,
            })
                .to(
                    '.preloader-bar-fill',
                    { scaleX: 1, duration: 0.9, ease: 'power2.inOut' },
                    '-=0.1',
                )
                .to('.preloader-initials', { y: -20, opacity: 0, duration: 0.35 }, '+=0.2')
                .to('.preloader-bar', { opacity: 0, duration: 0.25 }, '<')
                .to(preloaderRef.current, { opacity: 0, duration: 0.4 })
                .set(preloaderRef.current, { display: 'none' });
        },
        { scope: preloaderRef },
    );

    return (
        <div
            ref={preloaderRef}
            className="fixed inset-0 z-[6] bg-background flex flex-col items-center justify-center gap-6"
        >
            <p className="preloader-initials font-anton text-[22vw] lg:text-[180px] leading-none text-primary">
                TL
            </p>
            <div className="preloader-bar w-32 h-[2px] bg-background-light overflow-hidden rounded-full">
                <div className="preloader-bar-fill h-full bg-primary origin-left scale-x-0 rounded-full"></div>
            </div>
        </div>
    );
};

export default Preloader;
