'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useRef } from 'react';

gsap.registerPlugin(useGSAP);

const Preloader = () => {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const leaves = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 6 + ((i * 7) % 86),
        size: 10 + ((i * 3) % 9),
        duration: 2.2 + ((i * 0.17) % 1.25),
        delay: -(i * 0.25),
    }));

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: 'power2.inOut' },
            });

            tl.fromTo(
                '.preloader-flower-wrap',
                { filter: 'blur(8px)', y: 16, opacity: 0 },
                { filter: 'blur(0px)', y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
            )
                .to(
                    '.preloader-bar-fill',
                    { scaleX: 1, duration: 1.1, ease: 'power2.inOut' },
                    '-=0.15',
                )
                .to('.preloader-leaf', { opacity: 0, duration: 0.25 }, '+=0.2')
                .to('.preloader-flower-wrap', { y: -22, opacity: 0, duration: 0.35 }, '<')
                .to('.preloader-bar', { opacity: 0, duration: 0.25 }, '<')
                .call(() => {
                    document.documentElement.setAttribute('data-preloader-done', 'true');
                    window.dispatchEvent(new CustomEvent('preloader:done'));
                })
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
            <div className="preloader-flower-wrap relative -mt-12 md:-mt-16 w-[180px] h-[180px] md:w-[220px] md:h-[220px]">
                <div className="absolute inset-0 pointer-events-none">
                    {leaves.map((leaf) => (
                        <span
                            key={leaf.id}
                            className="preloader-leaf absolute"
                            style={{
                                left: `${leaf.left}%`,
                                top: '-12%',
                                width: `${leaf.size}px`,
                                height: `${leaf.size + 6}px`,
                                animationDuration: `${leaf.duration}s`,
                                animationDelay: `${leaf.delay}s`,
                            }}
                        >
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 12 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    className="preloader-fall-leaf"
                                    d="M6 1C8.7 4.2 10.6 8.3 10.6 11.2C10.6 14.7 8.5 17 6 17C3.5 17 1.4 14.7 1.4 11.2C1.4 8.3 3.3 4.2 6 1Z"
                                />
                                <path
                                    className="preloader-fall-leaf-vein"
                                    d="M6 3.5V15.5"
                                    strokeWidth="0.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    ))}
                </div>
                <svg
                    className="preloader-flower w-full h-full"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Flower preloader"
                >
                    <circle className="preloader-core" cx="60" cy="42" r="12" />
                    <ellipse className="preloader-petal" cx="60" cy="22" rx="10" ry="14" />
                    <ellipse className="preloader-petal" cx="60" cy="62" rx="10" ry="14" />
                    <ellipse className="preloader-petal" cx="40" cy="42" rx="14" ry="10" />
                    <ellipse className="preloader-petal" cx="80" cy="42" rx="14" ry="10" />
                    <ellipse className="preloader-petal" cx="46" cy="28" rx="10" ry="8" transform="rotate(-28 46 28)" />
                    <ellipse className="preloader-petal" cx="74" cy="28" rx="10" ry="8" transform="rotate(28 74 28)" />
                    <path className="preloader-stem" d="M60 54V106" strokeWidth="6" strokeLinecap="round" />
                    <path className="preloader-leaf-main" d="M60 78C48 72 42 79 44 88C54 90 60 86 60 78Z" />
                    <path className="preloader-leaf-main" d="M60 84C72 78 78 85 76 94C66 96 60 92 60 84Z" />
                </svg>
            </div>
            <div className="preloader-bar relative mt-10 md:mt-12 w-44 h-[4px] overflow-hidden rounded-full">
                <div className="preloader-bar-fill absolute inset-0 rounded-full origin-left scale-x-0"></div>
            </div>
            <style jsx>{`
                .preloader-leaf {
                    animation-name: preloaderLeafFall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    opacity: 0;
                    will-change: transform, opacity;
                }
                .preloader-bar {
                    background: rgba(17, 24, 39, 0.2);
                    border: 1px solid rgba(17, 24, 39, 0.3);
                }
                .preloader-bar-fill {
                    background: linear-gradient(90deg, #111827 0%, #374151 100%);
                }
                :global([data-theme='dark']) .preloader-bar {
                    background: rgba(243, 244, 246, 0.2);
                    border: 1px solid rgba(243, 244, 246, 0.35);
                }
                :global([data-theme='dark']) .preloader-bar-fill {
                    background: linear-gradient(90deg, #f3f4f6 0%, #d1d5db 100%);
                }
                .preloader-core {
                    fill: #f8fafc;
                    stroke: rgba(0, 0, 0, 0.7);
                    stroke-width: 1.4;
                }
                .preloader-petal {
                    fill: #e5e7eb;
                    stroke: rgba(0, 0, 0, 0.65);
                    stroke-width: 1.15;
                }
                .preloader-stem {
                    stroke: #000000;
                }
                .preloader-leaf-main {
                    fill: #d1d5db;
                    stroke: rgba(0, 0, 0, 0.55);
                    stroke-width: 0.95;
                }
                .preloader-fall-leaf {
                    fill: #d1d5db;
                    stroke: rgba(0, 0, 0, 0.65);
                    stroke-width: 0.7;
                }
                .preloader-fall-leaf-vein {
                    stroke: rgba(0, 0, 0, 0.7);
                }
                :global([data-theme='dark']) .preloader-core {
                    fill: #f3f4f6;
                    stroke: rgba(255, 255, 255, 0.82);
                }
                :global([data-theme='dark']) .preloader-petal {
                    fill: #9ca3af;
                    stroke: rgba(255, 255, 255, 0.86);
                }
                :global([data-theme='dark']) .preloader-stem {
                    stroke: #d1d5db;
                }
                :global([data-theme='dark']) .preloader-leaf-main {
                    fill: #6b7280;
                    stroke: rgba(255, 255, 255, 0.85);
                }
                :global([data-theme='dark']) .preloader-fall-leaf {
                    fill: #9ca3af;
                    stroke: rgba(255, 255, 255, 0.88);
                }
                :global([data-theme='dark']) .preloader-fall-leaf-vein {
                    stroke: rgba(17, 24, 39, 0.95);
                }
                @keyframes preloaderLeafFall {
                    0% {
                        transform: translate3d(0, -8px, 0) rotate(-12deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.95;
                    }
                    55% {
                        transform: translate3d(8px, 110px, 0) rotate(10deg);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translate3d(-10px, 220px, 0) rotate(28deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Preloader;
