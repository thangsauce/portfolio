'use client';
import ArrowAnimation from '@/components/ArrowAnimation';
import { apiFetch } from '@/lib/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useLenis } from 'lenis/react';
import React from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Banner = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const [resumeUrl, setResumeUrl] = React.useState('/resume.pdf');
    const titleRef = React.useRef<HTMLHeadingElement>(null);

    type ProjectCategoryKey = 'web_development' | 'cybersecurity' | 'network';

    const goToContact = () => {
        if (typeof window === 'undefined') return;
        const target = document.querySelector('#contact') as HTMLElement | null;
        if (!target) return;

        const isHorizontalMode =
            window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');

        if (isHorizontalMode) {
            const root = document.querySelector('.horizontal-mode') as HTMLElement | null;
            const track = root?.firstElementChild as HTMLElement | null;
            const panel = target.closest('.horizontal-panel') as HTMLElement | null;
            if (root && track && panel) {
                const horizontalDistance = Math.max(0, track.scrollWidth - window.innerWidth);
                const rootTop = root.getBoundingClientRect().top + window.scrollY;
                const panelOffset = Math.max(0, Math.min(horizontalDistance, panel.offsetLeft));
                const targetY = rootTop + panelOffset;
                if (lenis) {
                    lenis.scrollTo(targetY, { duration: 1.05 });
                } else {
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }
                return;
            }
        }

        if (lenis) {
            lenis.scrollTo('#contact', { duration: 1.05 });
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const goToProjectsCategory = (category: ProjectCategoryKey) => {
        if (typeof window === 'undefined') return;
        const target = document.querySelector('#selected-projects') as HTMLElement | null;
        if (!target) return;

        window.dispatchEvent(
            new CustomEvent('portfolio:project-category', { detail: category }),
        );

        const isHorizontalMode =
            window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');

        if (isHorizontalMode) {
            const root = document.querySelector('.horizontal-mode') as HTMLElement | null;
            const track = root?.firstElementChild as HTMLElement | null;
            const panel = target.closest('.horizontal-panel') as HTMLElement | null;
            if (root && track && panel) {
                const horizontalDistance = Math.max(0, track.scrollWidth - window.innerWidth);
                const rootTop = root.getBoundingClientRect().top + window.scrollY;
                const panelOffset = Math.max(0, Math.min(horizontalDistance, panel.offsetLeft));
                const targetY = rootTop + panelOffset;
                if (lenis) {
                    lenis.scrollTo(targetY, { duration: 1.05 });
                } else {
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }
                return;
            }
        }

        if (lenis) {
            lenis.scrollTo('#selected-projects', { duration: 1.05 });
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const renderAnimatedWord = (word: string, className?: string) => (
        <span className={className}>
            {word.split('').map((char, idx) => (
                <span key={`${word}-${idx}`} className="hero-letter inline-block will-change-transform">
                    {char}
                </span>
            ))}
        </span>
    );

    React.useEffect(() => {
        let mounted = true;
        apiFetch<{ url: string }>('/api/portfolio/resume')
            .then((r) => {
                if (mounted && r?.url) setResumeUrl(r.url);
            })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    useGSAP(
        () => {
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) return;
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'bottom 70%',
                    end: 'bottom 10%',
                    scrub: 1,
                },
            });
            tl.fromTo('.slide-up-and-fade', { y: 0 }, { y: -150, opacity: 0, stagger: 0.02 });
        },
        { scope: containerRef },
    );

    useGSAP(
        () => {
            const title = titleRef.current;
            if (!title) return;
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 1.8 });
            tl.set('.hero-letter', { transformOrigin: '50% 100%' })
                .fromTo(
                    '.hero-letter',
                    { yPercent: 130, opacity: 0, rotateX: -70, filter: 'blur(8px)' },
                    { yPercent: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 1.2, stagger: { each: 0.045, from: 'start' } },
                )
                .fromTo('.banner-title', { scale: 0.985 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, '-=0.85')
                .fromTo('.hero-title-sweep', { scaleX: 0, opacity: 0, transformOrigin: '0% 50%' }, { scaleX: 1, opacity: 1, duration: 0.55 }, '-=0.5')
                .to('.hero-title-sweep', { opacity: 0.35, duration: 0.25 });
        },
        { scope: containerRef },
    );

    return (
        <section className="relative overflow-hidden" id="banner">
            <ArrowAnimation mobileClassName="top-[54%] left-[86%] -translate-x-1/2 bottom-auto" />
            <div
                className="container min-h-[100svh] md:h-[100svh] pt-24 sm:pt-0 pb-10 flex flex-col justify-center relative"
                ref={containerRef}
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-10 lg:gap-12">
                    <div className="flex flex-col items-start max-w-[760px]">
                        <div className="relative w-full max-w-[700px]">
                            <h1
                                ref={titleRef}
                                className="banner-title slide-up-and-fade leading-[0.92] font-space-grotesk font-bold tracking-tight"
                            >
                                {renderAnimatedWord('IT', 'hero-shine-text block text-[32px] sm:text-[42px] md:text-[48px] font-space-grotesk uppercase tracking-[0.24em]')}
                                <span className="hero-shine-text block text-[52px] sm:text-[80px] md:text-[96px] lg:text-[102px]">
                                    {'SPECIALIST'.split('').map((char, idx) => (
                                        <span
                                            key={`specialist-${idx}`}
                                            className="hero-letter inline-block will-change-transform"
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            </h1>
                            <span className="hero-title-sweep absolute left-0 mt-2 block h-1.5 w-[200px] sm:w-[250px] rounded-full bg-primary/70 [[data-theme='light']_&]:bg-black/75" />
                        </div>
                        <div className="banner-description slide-up-and-fade mt-5 max-w-[52ch] text-base sm:text-lg leading-relaxed text-muted-foreground">
                            <button
                                type="button"
                                onClick={() => goToProjectsCategory('web_development')}
                                data-sprite-pass="true"
                                className="inline-flex items-center gap-1.5 mx-1.5 text-foreground text-[1.08em] transition-all duration-200 hover:text-primary [[data-theme='light']_&]:hover:text-black hover:[text-shadow:0_0_10px_rgba(255,255,255,0.55)] [[data-theme='light']_&]:hover:[text-shadow:0_0_0_rgba(0,0,0,0)] hover:[&>svg]:[filter:drop-shadow(0_0_6px_rgba(255,255,255,0.75))] [[data-theme='light']_&]:hover:[&>svg]:[filter:drop-shadow(0_0_0_rgba(0,0,0,0))]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary transition-all duration-200 [[data-theme='light']_&]:text-black">
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                                web development
                            </button>
                            <button
                                type="button"
                                onClick={() => goToProjectsCategory('cybersecurity')}
                                data-sprite-pass="true"
                                className="inline-flex items-center gap-1.5 mx-1.5 text-foreground text-[1.08em] transition-all duration-200 hover:text-primary [[data-theme='light']_&]:hover:text-black hover:[text-shadow:0_0_10px_rgba(255,255,255,0.55)] [[data-theme='light']_&]:hover:[text-shadow:0_0_0_rgba(0,0,0,0)] hover:[&>svg]:[filter:drop-shadow(0_0_6px_rgba(255,255,255,0.75))] [[data-theme='light']_&]:hover:[&>svg]:[filter:drop-shadow(0_0_0_rgba(0,0,0,0))]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary transition-all duration-200 [[data-theme='light']_&]:text-black">
                                    <path d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5l-8-3z" />
                                </svg>
                                cybersecurity
                            </button>
                            <button
                                type="button"
                                onClick={() => goToProjectsCategory('network')}
                                data-sprite-pass="true"
                                className="inline-flex items-center gap-1.5 mx-1.5 text-foreground text-[1.08em] transition-all duration-200 hover:text-primary [[data-theme='light']_&]:hover:text-black hover:[text-shadow:0_0_10px_rgba(255,255,255,0.55)] [[data-theme='light']_&]:hover:[text-shadow:0_0_0_rgba(0,0,0,0)] hover:[&>svg]:[filter:drop-shadow(0_0_6px_rgba(255,255,255,0.75))] [[data-theme='light']_&]:hover:[&>svg]:[filter:drop-shadow(0_0_0_rgba(0,0,0,0))]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary transition-all duration-200 [[data-theme='light']_&]:text-black">
                                    <circle cx="5" cy="12" r="2" />
                                    <circle cx="19" cy="6" r="2" />
                                    <circle cx="19" cy="18" r="2" />
                                    <path d="M7 12h4" />
                                    <path d="M13 12l4-4" />
                                    <path d="M13 12l4 4" />
                                </svg>
                                network
                            </button>
                        </div>
                        <div className="flex gap-4 flex-wrap mt-9 banner-button slide-up-and-fade">
                            <button
                                type="button"
                                onClick={goToContact}
                                className="group no-click-glow cta-border-pulse relative overflow-hidden h-12 px-8 inline-flex justify-center items-center text-lg uppercase font-anton tracking-widest rounded-full border border-border transition-all duration-300 ease-out bg-transparent text-foreground hover:border-white/50 hover:text-primary [[data-theme='light']_&]:border-zinc-400 [[data-theme='dark']_&]:border-white/35"
                            >
                                <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0">
                                    Let&apos;s Connect
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                    Let&apos;s Connect
                                </span>
                                <span className="invisible">Let&apos;s Connect</span>
                            </button>
                            <a
                                href={resumeUrl}
                                download="Thang_Le_Resume.pdf"
                                className="group no-click-glow cta-border-pulse h-12 px-8 inline-flex justify-center items-center text-lg uppercase font-anton tracking-widest border border-border hover:border-white/50 hover:text-primary transition-all overflow-hidden relative rounded-full [[data-theme='light']_&]:text-foreground [[data-theme='light']_&]:border-zinc-400 [[data-theme='dark']_&]:border-white/35"
                            >
                                <span className="transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0 absolute [[data-theme='light']_&]:text-foreground">Résumé</span>
                                <span className="transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 absolute [[data-theme='light']_&]:text-foreground">Download</span>
                                <span className="invisible">Résumé</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="md:absolute md:bottom-20 left-0 right-0 flex gap-8 md:gap-0 md:justify-between pt-6 mt-56 md:mt-0">
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1 [[data-theme='light']_&]:text-black">
                            University of Central Florida
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider [[data-theme='light']_&]:text-black/80">
                            School
                        </p>
                    </div>
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1 [[data-theme='light']_&]:text-black">
                            3+
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider [[data-theme='light']_&]:text-black/80">
                            Projects
                        </p>
                    </div>
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1 [[data-theme='light']_&]:text-black">
                            2027
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider [[data-theme='light']_&]:text-black/80">
                            Graduating
                        </p>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .cta-border-pulse {
                    animation: ctaBorderPulseDark 4.6s ease-in-out infinite;
                }

                :global([data-theme='light']) .cta-border-pulse {
                    animation-name: ctaBorderPulseLight;
                }

                @keyframes ctaBorderPulseDark {
                    0%,
                    100% {
                        box-shadow:
                            0 0 0 1px rgba(255, 255, 255, 0.18),
                            0 0 0 rgba(255, 255, 255, 0);
                    }
                    50% {
                        box-shadow:
                            0 0 0 1px rgba(255, 255, 255, 0.4),
                            0 0 16px rgba(255, 255, 255, 0.25);
                    }
                }

                @keyframes ctaBorderPulseLight {
                    0%,
                    100% {
                        box-shadow:
                            0 0 0 1px rgba(63, 63, 70, 0.28),
                            0 0 0 rgba(24, 24, 27, 0);
                    }
                    50% {
                        box-shadow:
                            0 0 0 1px rgba(39, 39, 42, 0.44),
                            0 0 14px rgba(24, 24, 27, 0.16);
                    }
                }

                .hero-shine-text {
                    color: #e5e7eb;
                    display: inline-block;
                    text-shadow:
                        0 -1px 0 rgba(255, 255, 255, 0.45),
                        0 1px 0 rgba(148, 163, 184, 0.42),
                        0 0 10px rgba(255, 255, 255, 0.14);
                }

                :global([data-theme='light']) .hero-shine-text {
                    color: #1f2937;
                    text-shadow:
                        0 -1px 0 rgba(255, 255, 255, 0.72),
                        0 1px 0 rgba(17, 24, 39, 0.18),
                        0 0 8px rgba(255, 255, 255, 0.16);
                }
            `}</style>
        </section>
    );
};

export default Banner;
