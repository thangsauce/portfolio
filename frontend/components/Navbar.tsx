'use client';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { MoveUpRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/data';

const MENU_LINKS = [
    {
        name: 'Home',
        url: '/',
    },
    {
        name: 'About Me',
        url: '/#about-me',
    },
    {
        name: 'Experience',
        url: '/#my-experience',
    },
    {
        name: 'Projects',
        url: '/#selected-projects',
    },
    {
        name: 'Certifications',
        url: '/#certifications',
    },
    {
        name: 'IT Skills',
        url: '/#it-skills',
    },
    {
        name: 'My Stack',
        url: '/#my-stack',
    },
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const lenis = useLenis();
    const isProjectPage = pathname?.startsWith('/projects/');
    const eyeRef = useRef<SVGSVGElement>(null);
    const pupilRef = useRef<SVGGElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const [menuBtnOffset, setMenuBtnOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef({
        active: false,
        moved: false,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
    });

    const scrollToY = (y: number) => {
        if (lenis) {
            lenis.scrollTo(y, { duration: 1.05 });
            return;
        }
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const navigateTo = (url: string) => {
        setIsMenuOpen(false);

        if (url === '/') {
            if (pathname === '/') {
                setTimeout(() => scrollToY(0), 120);
            } else {
                router.push('/');
            }
            return;
        }

        if (!url.startsWith('/#')) {
            router.push(url);
            return;
        }

        if (pathname !== '/') {
            router.push(url);
            return;
        }

        const hash = url.slice(1); // "#section-id"
        const target = document.querySelector(hash) as HTMLElement | null;
        if (!target) return;

        const isHorizontalMode =
            window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');

        // Desktop horizontal layout: map section panel index -> vertical scroll distance.
        if (isHorizontalMode) {
            const root = document.querySelector('.horizontal-mode') as HTMLElement | null;
            const track = root?.firstElementChild as HTMLElement | null;
            const panel = target.closest('.horizontal-panel') as HTMLElement | null;
            const panels = root
                ? Array.from(root.querySelectorAll('.horizontal-panel')) as HTMLElement[]
                : [];

            if (!root || !track || !panel || panels.length === 0) {
                setTimeout(() => lenis?.scrollTo(hash), 120);
                return;
            }

            const panelIndex = panels.indexOf(panel);
            const maxIndex = Math.max(1, panels.length - 1);
            const horizontalDistance = Math.max(0, track.scrollWidth - window.innerWidth);
            const rootTop = root.getBoundingClientRect().top + window.scrollY;
            const targetY = rootTop + (horizontalDistance * panelIndex) / maxIndex;
            setTimeout(() => scrollToY(targetY), 120);
            return;
        }

        // Mobile/normal layout.
        setTimeout(() => lenis?.scrollTo(hash), 120);
    };

    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 50);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applySystemTheme = (isDark: boolean) => {
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        };

        applySystemTheme(mediaQuery.matches);
        const handleChange = (e: MediaQueryListEvent) => {
            applySystemTheme(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const eye = eyeRef.current;
        const pupil = pupilRef.current;
        if (!eye || !pupil) return;

        const eyeMoveX = gsap.quickTo(eye, 'x', { duration: 0.18, ease: 'power3.out' });
        const eyeMoveY = gsap.quickTo(eye, 'y', { duration: 0.18, ease: 'power3.out' });
        const moveX = gsap.quickTo(pupil, 'x', { duration: 0.18, ease: 'power2.out' });
        const moveY = gsap.quickTo(pupil, 'y', { duration: 0.18, ease: 'power2.out' });
        let cursorOffsetY = 0;
        let scrollOffsetX = 0;
        let scrollOffsetY = 0;
        let scrollResetTimer: ReturnType<typeof setTimeout> | null = null;

        const applyEyeOffset = () => {
            eyeMoveX(gsap.utils.clamp(-14, 14, scrollOffsetX));
            eyeMoveY(gsap.utils.clamp(-14, 14, cursorOffsetY + scrollOffsetY));
        };

        const onMove = (e: MouseEvent) => {
            const rect = eye.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const max = 10;
            const dist = Math.hypot(dx, dy) || 1;
            const clamped = Math.min(max, dist);
            const x = (dx / dist) * clamped;
            const y = (dy / dist) * clamped;
            moveX(x);
            moveY(y);
            cursorOffsetY = gsap.utils.clamp(-10, 10, dy * 0.12);
            applyEyeOffset();
        };

        const onWheel = (e: WheelEvent) => {
            scrollOffsetX = gsap.utils.clamp(-14, 14, e.deltaX * 0.16);
            scrollOffsetY = gsap.utils.clamp(-14, 14, e.deltaY * 0.16);
            applyEyeOffset();
            if (scrollResetTimer) clearTimeout(scrollResetTimer);
            scrollResetTimer = setTimeout(() => {
                scrollOffsetX = 0;
                scrollOffsetY = 0;
                applyEyeOffset();
            }, 190);
        };

        const onLeave = () => {
            moveX(0);
            moveY(0);
            cursorOffsetY = 0;
            scrollOffsetX = 0;
            scrollOffsetY = 0;
            applyEyeOffset();
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('mouseleave', onLeave, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('mouseleave', onLeave);
            if (scrollResetTimer) clearTimeout(scrollResetTimer);
        };
    }, []);

    const handleMenuPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        const st = dragRef.current;
        st.active = true;
        st.moved = false;
        st.startX = e.clientX;
        st.startY = e.clientY;
        st.originX = menuBtnOffset.x;
        st.originY = menuBtnOffset.y;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleMenuPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        const st = dragRef.current;
        if (!st.active) return;
        const dx = e.clientX - st.startX;
        const dy = e.clientY - st.startY;
        const movedDistance = Math.hypot(dx, dy);
        if (movedDistance > 3) st.moved = true;

        const nextX = st.originX + dx;
        const nextY = st.originY + dy;
        const clampX = Math.max(-220, Math.min(220, nextX));
        const clampY = Math.max(-140, Math.min(140, nextY));
        setMenuBtnOffset({ x: clampX, y: clampY });
    };

    const handleMenuPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        const st = dragRef.current;
        st.active = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handleMenuToggle = () => {
        const st = dragRef.current;
        if (st.moved) {
            st.moved = false;
            return;
        }

        if (menuButtonRef.current) {
            gsap.fromTo(
                menuButtonRef.current,
                { scale: 1 },
                { scale: 1.14, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 },
            );
        }
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <>
            <div className="sticky top-0 z-[4]">
                {!isProjectPage && (
                    <Link
                        href="/"
                        aria-label="Go to homepage"
                        className="absolute top-5 left-5 md:left-10 z-[2] h-16 w-24 flex items-center justify-center text-primary/80"
                    >
                        <svg
                            ref={eyeRef}
                            viewBox="0 0 120 70"
                            className="h-12 w-20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <defs>
                                <clipPath id="nav-eye-clip">
                                    <path d="M6 35C18 15 38 6 60 6C82 6 102 15 114 35C102 55 82 64 60 64C38 64 18 55 6 35Z" />
                                </clipPath>
                            </defs>
                            <path
                                d="M6 35C18 15 38 6 60 6C82 6 102 15 114 35C102 55 82 64 60 64C38 64 18 55 6 35Z"
                                fill="hsl(var(--background))"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <g clipPath="url(#nav-eye-clip)">
                                <rect x="0" y="0" width="120" height="70" fill="hsl(var(--background))" />
                                <g ref={pupilRef}>
                                    <circle cx="60" cy="35" r="11" fill="currentColor" />
                                    <circle cx="60" cy="35" r="3" fill="hsl(var(--background))" />
                                </g>
                                <path
                                    className="eye-lid-svg"
                                    d="M6 35C18 15 38 6 60 6C82 6 102 15 114 35C102 55 82 64 60 64C38 64 18 55 6 35Z"
                                    fill="hsl(var(--background))"
                                />
                            </g>
                        </svg>
                    </Link>
                )}


                <button
                    ref={menuButtonRef}
                    className={cn(
                        'group absolute top-5 right-5 md:right-10 z-[2] h-14 min-w-14 px-4 rounded-full bg-background/5 backdrop-blur-sm transition-all duration-300 touch-none',
                    )}
                    style={{ transform: `translate(${menuBtnOffset.x}px, ${menuBtnOffset.y}px)` }}
                    onPointerDown={handleMenuPointerDown}
                    onPointerMove={handleMenuPointerMove}
                    onPointerUp={handleMenuPointerUp}
                    onPointerCancel={handleMenuPointerUp}
                    onClick={handleMenuToggle}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    <span className="flex items-center gap-2.5">
                        <span className="relative inline-flex size-8 items-center justify-center">
                            <span
                                className={cn(
                                    'absolute h-0.5 w-5 rounded-full bg-foreground transition-transform duration-300',
                                    {
                                        'rotate-45': isMenuOpen,
                                        'group-hover:rotate-12': !isMenuOpen,
                                    },
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute h-5 w-0.5 rounded-full bg-foreground transition-transform duration-300',
                                    {
                                        '-rotate-45': isMenuOpen,
                                        'group-hover:-rotate-12': !isMenuOpen,
                                    },
                                )}
                            />
                            <span
                                className={cn(
                                    'absolute -right-1 -top-1 size-2 rounded-full bg-primary transition-opacity duration-300',
                                    {
                                        'opacity-0': isMenuOpen,
                                        'opacity-100': !isMenuOpen,
                                    },
                                )}
                            />
                        </span>
                    </span>
                </button>
            </div>

            <div
                className={cn(
                    'overlay fixed inset-0 z-[2] bg-black/70 transition-all duration-150',
                    {
                        'opacity-0 invisible pointer-events-none': !isMenuOpen,
                    },
                )}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            <div
                className={cn(
                    'fixed top-20 right-4 z-[3] overflow-hidden gap-y-2 transform transition-all duration-300 ease-linear',
                    'w-max max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 -translate-y-3 opacity-0 invisible pointer-events-none',
                    'md:top-5 md:left-1/2 md:right-auto md:w-max md:max-w-[calc(100vw-5rem)] md:h-auto md:min-h-0 md:rounded-xl md:border md:border-white/10 md:-translate-y-full md:-translate-x-1/2 md:opacity-100 md:visible md:pointer-events-auto',
                    'flex flex-col py-2 md:py-1',
                    {
                        'translate-y-0 opacity-100 visible pointer-events-auto md:translate-y-0 md:-translate-x-1/2': isMenuOpen,
                    },
                )}
            >
                <div
                    className={cn(
                        'absolute inset-0 bg-background-light/5 backdrop-blur-sm z-[-1]',
                    )}
                ></div>

                <div className="grow flex md:items-start w-auto px-4 md:px-5 lg:px-6">
                    <div className="flex gap-6 md:gap-6 lg:gap-8 md:justify-center md:items-start md:flex-row flex-col w-auto">
                        <div className="order-2 md:order-2">
                            <p className="text-primary/85 mb-3 md:mb-2">
                                SOCIAL
                            </p>
                            <ul className="space-y-1">
                                {SOCIAL_LINKS.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center gap-2.5 text-base md:text-lg capitalize text-foreground/85 hover:text-foreground transition-colors duration-200"
                                        >
                                            {link.name === 'github' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-foreground/75 transition-all duration-200 group-hover:text-green-400 group-hover:[filter:drop-shadow(0_0_6px_#4ade80)]">
                                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                                </svg>
                                            )}
                                            {link.name === 'linkedin' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-foreground/75 transition-all duration-200 group-hover:text-blue-400 group-hover:[filter:drop-shadow(0_0_6px_#60a5fa)]">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                            )}
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-1">
                            <p className="text-primary/85 mb-3 md:mb-2">
                                MENU
                            </p>
                            <ul className="space-y-1 md:space-y-0 md:grid md:grid-rows-3 md:grid-flow-col md:gap-x-8 md:gap-y-1">
                                {MENU_LINKS.map((link) => (
                                    <li key={link.name}>
                                        <button
                                            onClick={() => {
                                                navigateTo(link.url);
                                            }}
                                            className="group text-base md:text-lg flex items-center gap-3 text-left"
                                        >
                                            <span
                                                className="size-4 flex items-center justify-center text-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                                            >
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M2.5 13.2L10 12l1.8-8c.2-.8 1.3-.8 1.6 0L15.2 12l6.3 1.2c.7.1.7 1.1 0 1.3L15.2 16l-1.8 4.1c-.3.8-1.4.8-1.7 0L10 16l-7.5-1.5c-.7-.1-.7-1.1 0-1.3z" />
                                                </svg>
                                            </span>
                                            {link.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-3">
                            <p className="text-primary/85 mb-3 md:mb-2">ACTION</p>
                            <button
                                onClick={() => {
                                    navigateTo('/#contact');
                                }}
                                className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                            >
                                <span className="text-sm md:text-base uppercase tracking-widest">Let's Connect</span>
                                <MoveUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .eye-lid-svg {
                    transform-box: fill-box;
                    transform-origin: center;
                    animation: eyeBlink 5.8s ease-in-out infinite;
                }
                @keyframes eyeBlink {
                    0%,
                    43%,
                    48%,
                    100% {
                        transform: scaleY(0);
                    }
                    45%,
                    46% {
                        transform: scaleY(1);
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;
