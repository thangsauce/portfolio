'use client';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/data';

const MENU_LINKS = [
    {
        name: 'Home',
        url: '/#banner',
    },
    {
        name: 'About Me',
        url: '/#about-me',
    },
    {
        name: 'Currently Using',
        url: '/#currently-using',
    },
    {
        name: 'Projects',
        url: '/#selected-projects',
    },
    {
        name: 'Experience',
        url: '/#my-experience',
    },
    {
        name: 'My Stack',
        url: '/#my-stack',
    },
    {
        name: 'Certifications',
        url: '/#certifications',
    },
];

const SOCIAL_MENU_LINKS = [
    ...SOCIAL_LINKS,
    {
        name: 'blog',
        url: '/blog',
        internal: true,
    },
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [showThemeToggle, setShowThemeToggle] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const lenis = useLenis();
    const isProjectPage = pathname === '/projects' || pathname?.startsWith('/projects/');
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
    const PENDING_HASH_KEY = 'pending-home-hash';

    const scrollToY = (y: number) => {
        if (lenis) {
            lenis.scrollTo(y, { duration: 1.05 });
            return;
        }
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const scrollToElement = (target: HTMLElement) => {
        if (lenis) {
            lenis.scrollTo(target, { duration: 1.05 });
            return;
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToHash = (hash: string) => {
        const target = document.querySelector(hash) as HTMLElement | null;
        if (!target) return;

        const isHorizontalMode =
            window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');

        // Desktop horizontal layout: map section panel index -> vertical scroll distance.
        if (isHorizontalMode) {
            const root = document.querySelector('.horizontal-mode') as HTMLElement | null;
            const track = root?.firstElementChild as HTMLElement | null;
            const panel = target.closest('.horizontal-panel') as HTMLElement | null;
            if (!root || !track || !panel) {
                setTimeout(() => scrollToElement(target), 120);
                return;
            }

            const horizontalDistance = Math.max(0, track.scrollWidth - window.innerWidth);
            const rootTop = root.getBoundingClientRect().top + window.scrollY;
            const panelRect = panel.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const sectionOffsetInsidePanel = Math.max(0, targetRect.left - panelRect.left);
            const targetOffset = panel.offsetLeft + sectionOffsetInsidePanel;
            const panelOffset = Math.max(0, Math.min(horizontalDistance, targetOffset));
            const targetY = rootTop + panelOffset;
            setTimeout(() => scrollToY(targetY), 120);
            return;
        }

        // Mobile/normal layout.
        setTimeout(() => scrollToElement(target), 120);
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

        const hash = url.slice(1); // "#section-id"

        if (pathname !== '/') {
            window.sessionStorage.setItem(PENDING_HASH_KEY, hash);
            router.push('/');
            return;
        }

        scrollToHash(hash);
    };

    useEffect(() => {
        if (pathname !== '/') return;
        const pendingHash = window.sessionStorage.getItem(PENDING_HASH_KEY);
        if (!pendingHash) return;

        const run = () => {
            scrollToHash(pendingHash);
            window.sessionStorage.removeItem(PENDING_HASH_KEY);
        };

        const timer = window.setTimeout(run, 220);
        return () => window.clearTimeout(timer);
    }, [pathname, lenis]);

    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 50);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setIsMenuOpen(false);
        };
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (pathname !== '/') {
            setShowThemeToggle(false);
            return;
        }

        const hero = document.querySelector('#banner') as HTMLElement | null;
        if (!hero) {
            setShowThemeToggle(false);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowThemeToggle(entry.isIntersecting && entry.intersectionRatio > 0.45);
            },
            {
                threshold: [0, 0.2, 0.45, 0.6, 0.8, 1],
            },
        );

        observer.observe(hero);
        return () => observer.disconnect();
    }, [pathname]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const saved = window.localStorage.getItem('theme-preference') as 'light' | 'dark' | null;
        const initialTheme = saved ?? (mediaQuery.matches ? 'dark' : 'light');

        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);

        const handleChange = (e: MediaQueryListEvent) => {
            const override = window.localStorage.getItem('theme-preference');
            if (override) return;
            const nextTheme = e.matches ? 'dark' : 'light';
            setTheme(nextTheme);
            document.documentElement.setAttribute('data-theme', nextTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        window.localStorage.setItem('theme-preference', nextTheme);
    };

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
                        href="/#banner"
                        aria-label="Go to homepage"
                        className="absolute top-2 left-5 md:top-1 md:left-6 z-[2] h-20 w-28 md:h-24 md:w-36 flex items-center justify-center text-primary/85"
                    >
                        <svg
                            viewBox="0 0 120 72"
                            className="h-16 w-24 md:h-20 md:w-32 shooting-star"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M10 52H76"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                opacity="0.24"
                                className="shooting-star-tail"
                            />
                            <path
                                d="M16 46H84"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                opacity="0.38"
                                className="shooting-star-tail"
                            />
                            <path
                                d="M24 40H90"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                opacity="0.5"
                                className="shooting-star-tail"
                            />
                            <g className="shooting-star-head">
                                <path d="M88 31L92.8 41L104 45L92.8 49L88 59L83.2 49L72 45L83.2 41L88 31Z" fill="currentColor" />
                                <circle cx="88" cy="45" r="2.6" fill="hsl(var(--background))" opacity="0.7" />
                            </g>
                        </svg>
                    </Link>
                )}


                <button
                    ref={menuButtonRef}
                    className={cn(
                        'group absolute top-5 right-5 z-[2] h-14 min-w-14 px-4 rounded-full bg-background/5 backdrop-blur-sm transition-all duration-300 touch-none md:hidden',
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
                                    'absolute -right-1 -top-1 size-2 rounded-full bg-primary menu-dot-blink transition-opacity duration-300',
                                    {
                                        'opacity-0': isMenuOpen,
                                        'opacity-100': !isMenuOpen,
                                    },
                                )}
                            />
                        </span>
                    </span>
                </button>

                <button
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    className={cn(
                        'absolute top-5 right-5 md:right-10 z-[2] hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/30 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-500',
                        showThemeToggle
                            ? 'md:opacity-100 md:pointer-events-auto'
                            : 'md:opacity-0 md:pointer-events-none',
                    )}
                >
                    {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2" />
                            <path d="M12 21v2" />
                            <path d="m4.22 4.22 1.42 1.42" />
                            <path d="m18.36 18.36 1.42 1.42" />
                            <path d="M1 12h2" />
                            <path d="M21 12h2" />
                            <path d="m4.22 19.78 1.42-1.42" />
                            <path d="m18.36 5.64 1.42-1.42" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>
            </div>

            <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className={cn(
                    'fixed bottom-5 right-5 z-[4] inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/40 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-500',
                    showThemeToggle
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none',
                )}
            >
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2" />
                        <path d="M12 21v2" />
                        <path d="m4.22 4.22 1.42 1.42" />
                        <path d="m18.36 18.36 1.42 1.42" />
                        <path d="M1 12h2" />
                        <path d="M21 12h2" />
                        <path d="m4.22 19.78 1.42-1.42" />
                        <path d="m18.36 5.64 1.42-1.42" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                )}
            </button>

            <div
                className={cn(
                    'overlay fixed inset-0 z-[2] bg-black/70 transition-all duration-150 md:hidden',
                    {
                        'opacity-0 invisible pointer-events-none': !isMenuOpen,
                    },
                )}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            <div
                className={cn(
                    'fixed top-20 right-4 z-[3] overflow-hidden gap-y-2 transform transition-all duration-300 ease-linear',
                    'w-max max-w-[calc(100vw-2rem)] rounded-xl border border-border/70 -translate-y-3 opacity-0 invisible pointer-events-none',
                    'md:top-5 md:left-1/2 md:right-auto md:max-w-none md:-translate-x-1/2 md:translate-y-0 md:opacity-100 md:visible md:pointer-events-auto',
                    'flex flex-col py-2 md:py-1',
                    {
                        'translate-y-0 opacity-100 visible pointer-events-auto md:-translate-x-1/2': isMenuOpen,
                    },
                )}
            >
                <div className="absolute inset-0 bg-background/85 backdrop-blur-md z-[-1]" />
                <div className="grow flex w-auto px-4 md:px-4 lg:px-5">
                    <div className="flex gap-6 flex-col md:flex-row md:items-center md:gap-4 w-auto">
                        <div className="order-2">
                            <p className="text-primary mb-3 md:mb-0 md:mr-2 text-xs md:text-[11px] tracking-[0.14em] md:hidden">
                                SOCIAL
                            </p>
                            <ul className="space-y-1 md:space-y-0 md:flex md:items-center md:gap-4">
                                {SOCIAL_MENU_LINKS.map((link) => (
                                    <li key={link.name}>
                                        {'internal' in link && link.internal ? (
                                            <button
                                                onClick={() => navigateTo(link.url)}
                                            className="nav-shake group flex items-center gap-2 md:gap-2.5 text-base md:text-[15px] capitalize text-foreground transition-colors duration-200 hover:text-white"
                                            >
                                                <img
                                                    src="https://cdn-icons-png.flaticon.com/512/2125/2125457.png"
                                                    alt=""
                                                    width="18"
                                                    height="18"
                                                    aria-hidden="true"
                                                    className="opacity-80 transition-opacity duration-200 group-hover:opacity-100 dark:brightness-0 dark:invert"
                                                />
                                                {link.name}
                                            </button>
                                        ) : (
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="nav-shake group flex items-center gap-2 md:gap-2.5 text-base md:text-[15px] capitalize text-foreground transition-colors duration-200 hover:text-white"
                                            >
                                                {link.name === 'github' && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-foreground/75 transition-all duration-200 group-hover:text-white">
                                                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                                    </svg>
                                                )}
                                                {link.name === 'linkedin' && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-foreground/75 transition-all duration-200 group-hover:text-white">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                    </svg>
                                                )}
                                                {link.name}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:hidden">
                            <p className="text-primary mb-3">
                                MENU
                            </p>
                            <ul className="space-y-1">
                                {MENU_LINKS.map((link) => (
                                    <li key={link.name}>
                                        <button
                                            onClick={() => {
                                                navigateTo(link.url);
                                            }}
                                            className="nav-shake group text-base flex items-center gap-3 text-left hover:text-white transition-colors duration-200"
                                        >
                                            <span
                                                className="size-4 flex items-center justify-center text-foreground/40 group-hover:text-white group-hover:translate-x-0.5 transition-all"
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
                    </div>
                </div>
            </div>
            <style jsx>{`
                .shooting-star {
                    animation: starDrift 2.8s ease-in-out infinite;
                }
                .shooting-star-tail {
                    transform-origin: 92px 38px;
                    animation: tailPulse 2.8s ease-in-out infinite;
                }
                .shooting-star-head {
                    transform-origin: 94px 38px;
                    animation: starTwinkle 2.8s ease-in-out infinite;
                }
                .menu-dot-blink {
                    animation: menuDotBlink 2.4s ease-in-out infinite;
                }
                @keyframes starDrift {
                    0% { transform: translate(0px, 0px) rotate(-4deg); opacity: 0.84; }
                    35% { transform: translate(3px, -2px) rotate(-2deg); opacity: 1; }
                    70% { transform: translate(-2px, 1px) rotate(-5deg); opacity: 0.92; }
                    100% { transform: translate(0px, 0px) rotate(-4deg); opacity: 0.84; }
                }
                @keyframes tailPulse {
                    0%, 100% { opacity: 0.24; }
                    50% { opacity: 0.58; }
                }
                @keyframes starTwinkle {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px currentColor); }
                    50% { transform: scale(1.08); filter: drop-shadow(0 0 6px currentColor); }
                }
                .nav-shake:hover {
                    animation: navShake 0.34s ease-in-out;
                }
                @keyframes navShake {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-1.5px) rotate(-0.6deg); }
                    40% { transform: translateX(1.5px) rotate(0.6deg); }
                    60% { transform: translateX(-1px) rotate(-0.3deg); }
                    80% { transform: translateX(1px) rotate(0.3deg); }
                    100% { transform: translateX(0); }
                }
                @keyframes menuDotBlink {
                    0%,
                    100% {
                        opacity: 0.35;
                        transform: scale(0.9);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.15);
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;
