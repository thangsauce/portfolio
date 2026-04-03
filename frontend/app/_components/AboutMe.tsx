'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AboutMe = () => {
    const container = React.useRef<HTMLDivElement>(null);
    const dragonRef = React.useRef<HTMLDivElement>(null);
    const planeTrackRef = React.useRef<HTMLDivElement>(null);
    const planeRef = React.useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from('.slide-up-and-fade', {
                    y: 80,
                    opacity: 0,
                    stagger: 0.05,
                    ease: 'power2.out',
                    duration: 0.9,
                });
                return;
            }
            const tl = gsap.timeline({
                scrollTrigger: {
                    id: 'about-me-in',
                    trigger: container.current,
                    start: 'top 70%',
                    end: 'bottom bottom',
                    scrub: 0.5,
                },
            });

            tl.from('.slide-up-and-fade', {
                y: 150,
                opacity: 0,
                stagger: 0.05,
            });
        },
        { scope: container },
    );

    useGSAP(
        () => {
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) return;
            const tl = gsap.timeline({
                scrollTrigger: {
                    id: 'about-me-out',
                    trigger: container.current,
                    start: 'bottom 50%',
                    end: 'bottom 10%',
                    scrub: 0.5,
                },
            });

            tl.to('.slide-up-and-fade', {
                y: -150,
                opacity: 0,
                stagger: 0.02,
            });
        },
        { scope: container },
    );

    useGSAP(
        () => {
            const section = container.current;
            const dragon = dragonRef.current;
            if (!section || !dragon || window.innerWidth < 768) return;

            const quickX = gsap.quickTo(dragon, 'x', { duration: 0.45, ease: 'power3.out' });
            const quickY = gsap.quickTo(dragon, 'y', { duration: 0.45, ease: 'power3.out' });
            const quickR = gsap.quickTo(dragon, 'rotate', { duration: 0.45, ease: 'power3.out' });

            const onMove = (e: MouseEvent) => {
                const rect = section.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const targetX = gsap.utils.clamp(-120, 120, x * 0.2);
                const targetY = gsap.utils.clamp(-80, 80, y * 0.18);
                quickX(targetX);
                quickY(targetY);
                quickR(gsap.utils.clamp(-8, 8, x * 0.02));
            };

            const onLeave = () => {
                quickX(0);
                quickY(0);
                quickR(0);
            };

            section.addEventListener('mousemove', onMove);
            section.addEventListener('mouseleave', onLeave);

            return () => {
                section.removeEventListener('mousemove', onMove);
                section.removeEventListener('mouseleave', onLeave);
            };
        },
        { scope: container },
    );

    useGSAP(
        () => {
            const track = planeTrackRef.current;
            const plane = planeRef.current;
            if (!track || !plane) return;

            const flightTween = gsap.fromTo(
                plane,
                { x: -70 },
                {
                    x: () => track.offsetWidth + 70,
                    duration: 8.5,
                    ease: 'none',
                    repeat: -1,
                    repeatDelay: 0.25,
                    repeatRefresh: true,
                },
            );

            const bobTween = gsap.to(plane, {
                y: -5,
                rotate: 2,
                duration: 0.9,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });

            return () => {
                flightTween.kill();
                bobTween.kill();
            };
        },
        { scope: container },
    );

    return (
        <section className="pb-section" id="about-me">
            <div className="container" ref={container}>
                <p className="slide-up-and-fade text-sm uppercase tracking-widest text-muted-foreground/60">
                    About Me
                </p>
                <div className="grid md:grid-cols-12 gap-y-10 md:gap-x-8 lg:gap-x-12 mt-6 md:mt-10 items-start">
                    <div className="md:col-span-5 space-y-6">
                        <p className="text-lg md:text-2xl font-light leading-relaxed slide-up-and-fade">
                            My goal is to keep growing as a professional
                            and contribute to meaningful technology projects
                            through my commitment and continuous learning.
                        </p>
                        <div className="slide-up-and-fade flex gap-6 items-center">
                            <a
                                href="https://github.com/thangsauce"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className="text-foreground hover:text-primary transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/in/thang-le-it/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="text-foreground hover:text-primary transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-center">
                        <div
                            ref={dragonRef}
                            className="slide-up-and-fade pointer-events-none select-none relative h-28 w-28 md:h-36 md:w-36"
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl" />
                            <svg
                                viewBox="0 0 120 120"
                                className="relative h-full w-full text-primary drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M22 68C22 46 39 30 60 30C79 30 94 43 96 62C98 82 83 95 63 95H43" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
                                <path d="M43 95L55 83" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
                                <path d="M43 95L56 106" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
                                <path d="M74 27L68 14" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                                <path d="M88 33L99 23" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                                <circle cx="78" cy="54" r="4.5" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>

                    <div className="md:col-span-5">
                        <div className="text-lg text-muted-foreground max-w-[520px] space-y-6">
                            <p className="slide-up-and-fade text-lg md:text-2xl font-light leading-relaxed text-foreground/95">
                                With projects like web platforms and security
                                monitoring tools, I&apos;m constantly picking up new
                                technologies and sharpening my problem-solving
                                skills.
                            </p>
                            <div>
                            <p className="slide-up-and-fade text-sm uppercase tracking-widest text-muted-foreground/60">
                                Languages
                            </p>
                            <p className="mt-1 slide-up-and-fade">
                                English &middot; Vietnamese
                            </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="slide-up-and-fade mt-10 md:mt-14">
                    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/20 backdrop-blur-sm h-52 md:h-60">
                        <div className="absolute inset-0 opacity-80">
                            <svg
                                viewBox="0 0 800 280"
                                className="h-full w-full text-foreground/20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path d="M0 45H800M0 95H800M0 145H800M0 195H800M0 245H800" stroke="currentColor" strokeWidth="1" />
                                <path d="M80 0V280M180 0V280M280 0V280M380 0V280M480 0V280M580 0V280M680 0V280" stroke="currentColor" strokeWidth="1" />
                                <path d="M20 225C120 190 180 210 260 170C340 130 420 155 490 126C570 93 658 106 780 52" stroke="currentColor" strokeOpacity="0.5" strokeWidth="9" strokeLinecap="round" />
                                <path d="M25 70C150 120 210 100 320 145C430 190 560 175 780 235" stroke="currentColor" strokeOpacity="0.35" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="520" cy="138" r="12" fill="currentColor" />
                                <circle cx="520" cy="138" r="22" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/75 via-background/20 to-transparent" />

                        <div className="absolute left-4 top-4 rounded-full border border-primary/45 bg-background/70 px-4 py-1.5 text-sm sm:text-base tracking-wide text-foreground shadow-[0_0_14px_rgba(255,255,255,0.25)]">
                            Based in <span className="text-primary">Orlando, FL</span>
                        </div>

                        <div
                            ref={planeTrackRef}
                            className="pointer-events-none absolute left-0 right-0 bottom-2 h-12"
                            aria-hidden="true"
                        >
                            <div className="absolute left-3 right-3 top-6 border-t border-dashed border-primary/55" />
                            <div ref={planeRef} className="absolute top-1 left-0 text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]">
                                <svg
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M2.5 13.2L10 12l1.8-8c.2-.8 1.3-.8 1.6 0L15.2 12l6.3 1.2c.7.1.7 1.1 0 1.3L15.2 16l-1.8 4.1c-.3.8-1.4.8-1.7 0L10 16l-7.5-1.5c-.7-.1-.7-1.1 0-1.3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
