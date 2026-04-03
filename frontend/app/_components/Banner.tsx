'use client';
import ArrowAnimation from '@/components/ArrowAnimation';
import Button from '@/components/Button';
import { apiFetch } from '@/lib/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useLenis } from 'lenis/react';
import Image from 'next/image';
import React from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Banner = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const [resumeUrl, setResumeUrl] = React.useState('/resume.pdf');
    const titleRef = React.useRef<HTMLHeadingElement>(null);

    // ── Speech bubble typewriter ─────────────────────────────────────────
    const [bubbleText, setBubbleText] = React.useState('');
    const [showCursor, setShowCursor] = React.useState(false);
    const [showEmoji,  setShowEmoji]  = React.useState(false);
    const bubblePrefix = "Hi! I'm ";
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

    // Typewriter: starts after bubble pops in (3.9s)
    React.useEffect(() => {
        const full = `${bubblePrefix}Thang Le`;
        let i = 0;
        const start = setTimeout(() => {
            setShowCursor(true);
            const interval = setInterval(() => {
                i++;
                setBubbleText(full.slice(0, i));
                if (i >= full.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setShowEmoji(true);
                        setTimeout(() => setShowCursor(false), 900);
                    }, 150);
                }
            }, 58);
            return () => clearInterval(interval);
        }, 3900);
        return () => clearTimeout(start);
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
                                className="banner-title slide-up-and-fade leading-[0.92] font-sans font-bold tracking-tight"
                            >
                                {renderAnimatedWord('IT', 'text-primary block text-[32px] sm:text-[42px] md:text-[48px] font-anton uppercase tracking-[0.24em]')}
                                <span className="block text-[52px] sm:text-[80px] md:text-[96px] lg:text-[102px]">
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
                            <span className="hero-title-sweep absolute left-0 mt-2 block h-1.5 w-[200px] sm:w-[250px] rounded-full bg-primary/70" />
                        </div>
                        <div className="banner-description slide-up-and-fade mt-5 max-w-[52ch] text-base sm:text-lg leading-relaxed text-muted-foreground">
                            <button
                                type="button"
                                onClick={() => goToProjectsCategory('web_development')}
                                className="inline-flex items-center gap-1.5 mx-1.5 text-foreground text-[1.08em] transition-all duration-200 hover:text-primary hover:[text-shadow:0_0_10px_rgba(52,211,153,0.55)] hover:[&>svg]:[filter:drop-shadow(0_0_6px_rgba(52,211,153,0.75))]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary transition-all duration-200">
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                                web development
                            </button>
                            <button
                                type="button"
                                onClick={() => goToProjectsCategory('cybersecurity')}
                                className="inline-flex items-center gap-1.5 mx-1.5 text-foreground text-[1.08em] transition-all duration-200 hover:text-primary hover:[text-shadow:0_0_10px_rgba(52,211,153,0.55)] hover:[&>svg]:[filter:drop-shadow(0_0_6px_rgba(52,211,153,0.75))]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary transition-all duration-200">
                                    <path d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5l-8-3z" />
                                </svg>
                                cybersecurity
                            </button>
                            <button
                                type="button"
                                onClick={() => goToProjectsCategory('network')}
                                className="inline-flex items-center gap-1.5 mx-1.5 text-foreground text-[1.08em] transition-all duration-200 hover:text-primary hover:[text-shadow:0_0_10px_rgba(52,211,153,0.55)] hover:[&>svg]:[filter:drop-shadow(0_0_6px_rgba(52,211,153,0.75))]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary transition-all duration-200">
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
                            <Button
                                as="button"
                                variant="primary"
                                onClick={goToContact}
                                className="rounded-full"
                            >
                                Let&apos;s Connect
                            </Button>
                            <a
                                href={resumeUrl}
                                download="Thang_Le_Resume.pdf"
                                className="group h-12 px-8 inline-flex justify-center items-center text-lg uppercase font-anton tracking-widest border border-border hover:border-primary hover:text-primary transition-colors overflow-hidden relative rounded-full"
                            >
                                <span className="transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0 absolute">Résumé</span>
                                <span className="transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 absolute">Download</span>
                                <span className="invisible">Résumé</span>
                            </a>
                        </div>
                    </div>

                    <div className="slide-up-and-fade relative shrink-0 w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[390px] mx-0 mr-auto lg:mx-0 mt-12 lg:mt-0">

                        {/* ── Speech bubble ──────────────────────────── */}
                        <style>{`
                            @keyframes bubble-in {
                                0%   { opacity: 0; transform: scale(0.3) rotate(-8deg); }
                                55%  { opacity: 1; transform: scale(1.07) rotate(1.5deg); }
                                75%  { transform: scale(0.96) rotate(-0.5deg); }
                                100% { opacity: 1; transform: scale(1) rotate(0deg); }
                            }
                            @keyframes cursor-blink {
                                0%, 100% { opacity: 1; }
                                50%       { opacity: 0; }
                            }
                            @keyframes emoji-pop {
                                0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
                                60%  { transform: scale(1.4) rotate(10deg); }
                                100% { opacity: 1; transform: scale(1) rotate(0deg); }
                            }
                            @keyframes online-pulse {
                                0%, 100% { box-shadow: 0 0 0 0 hsl(158 64% 44% / 0.6); }
                                60%       { box-shadow: 0 0 0 5px hsl(158 64% 44% / 0); }
                            }
                        `}</style>

                        <div
                            className="absolute top-3 right-2 md:-top-8 md:-right-10 z-10"
                            style={{
                                transformOrigin: 'bottom right',
                                animation: 'bubble-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 3.8s both',
                            }}
                        >
                            {/* Bubble body */}
                            <div style={{
                                background: '#ffffff',
                                backdropFilter: 'blur(28px)',
                                WebkitBackdropFilter: 'blur(28px)',
                                borderRadius: 14,
                                padding: '8px 10px 10px',
                                boxShadow: '0 12px 34px rgba(0,0,0,0.28)',
                                width: 'fit-content',
                                maxWidth: 220,
                                position: 'relative',
                            }}>
                                {/* Header row: timestamp */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    marginBottom: 4,
                                    paddingBottom: 4,
                                    borderBottom: '1px solid hsl(158 64% 42% / 0.12)',
                                }}>
                                    <span style={{
                                        fontSize: 7,
                                        color: '#5f5f5f',
                                        fontFamily: 'var(--font-roboto-flex)',
                                        letterSpacing: '0.04em',
                                    }}>
                                        now
                                    </span>
                                </div>

                                {/* Typed message */}
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    fontFamily: 'var(--font-roboto-flex)',
                                    minHeight: 18,
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
                                        <span style={{ color: '#111111' }}>
                                            {bubbleText.slice(0, Math.min(bubbleText.length, bubblePrefix.length))}
                                        </span>
                                        <span style={{ color: 'hsl(158 64% 42%)' }}>
                                            {bubbleText.length > bubblePrefix.length ? bubbleText.slice(bubblePrefix.length) : ''}
                                        </span>
                                    </span>
                                    {showCursor && (
                                        <span style={{
                                            display: 'inline-block',
                                            width: 2, height: 13,
                                            background: 'hsl(158 64% 44%)',
                                            borderRadius: 1,
                                            marginLeft: 2, flexShrink: 0,
                                            animation: 'cursor-blink 0.65s ease-in-out infinite',
                                        }} />
                                    )}
                                    {showEmoji && (
                                        <span style={{
                                            display: 'inline-block',
                                            marginLeft: 4, fontSize: 14, lineHeight: 1,
                                            animation: 'emoji-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                                        }}>
                                            ヾ(＾∇＾)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tail — points down-left from bubble border */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 8,
                                    bottom: -4,
                                    width: 12,
                                    height: 12,
                                    background: '#ffffff',
                                    transform: 'rotate(-35deg)',
                                    borderRadius: 2,
                                    boxShadow: '-3px 3px 8px rgba(0,0,0,0.12)',
                                }}
                            />
                        </div>

                        <div className="relative overflow-hidden">
                            <Image
                                src="/me.png"
                                alt="Portrait of Thang Le"
                                width={768}
                                height={768}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="md:absolute bottom-8 left-0 right-0 flex gap-8 md:gap-0 md:justify-between pt-6 mt-8 md:mt-0">
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1">
                            University of Central Florida
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            School
                        </p>
                    </div>
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1">
                            3+
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            Projects
                        </p>
                    </div>
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1">
                            2027
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            Graduating
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
