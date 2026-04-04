'use client';
import { GENERAL_INFO } from '@/lib/data';
import { useLenis } from 'lenis/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const FIRE_W = 32;
const FIRE_H = 20;
const FIRE_CHARS = '  ....,,;;::==++xxXX##@@';

function Campfire() {
    const preRef = useRef<HTMLPreElement>(null);
    const bufRef = useRef(new Uint8Array(FIRE_W * FIRE_H));
    const rafRef = useRef(0);

    useEffect(() => {
        const buf = bufRef.current;

        const setSource = () => {
            const mid = Math.floor(FIRE_W / 2);
            const half = Math.floor(FIRE_W / 5);
            for (let x = 0; x < FIRE_W; x++) {
                const dist = Math.abs(x - mid);
                const base =
                    dist <= half ? 255 : Math.max(0, 255 - (dist - half) * 55);
                buf[(FIRE_H - 1) * FIRE_W + x] = Math.max(
                    0,
                    base - Math.floor(Math.random() * 30),
                );
            }
        };

        const spread = () => {
            for (let x = 0; x < FIRE_W; x++) {
                for (let y = 1; y < FIRE_H; y++) {
                    const src = buf[y * FIRE_W + x];
                    if (src === 0) {
                        buf[(y - 1) * FIRE_W + x] = 0;
                    } else {
                        const rand = Math.round(Math.random() * 3);
                        const dst = (x - rand + 1 + FIRE_W) % FIRE_W;
                        buf[(y - 1) * FIRE_W + dst] = Math.max(
                            0,
                            src - (rand & 1),
                        );
                    }
                }
            }
        };

        const render = () => {
            let out = '';
            for (let y = 0; y < FIRE_H; y++) {
                for (let x = 0; x < FIRE_W; x++) {
                    const v = buf[y * FIRE_W + x];
                    const ci = Math.floor((v * (FIRE_CHARS.length - 1)) / 255);
                    out += FIRE_CHARS[ci];
                }
                out += '\n';
            }
            // Firewood logs — centered to FIRE_W (32)
            out += '         /\\/\\/\\/\\/\\/\\/\\         \n';
            out += '        /              \\        \n';
            out += '       /________________\\       ';
            return out;
        };

        let last = 0;
        const INTERVAL = 1000 / 30;

        const tick = (time: number) => {
            if (time - last >= INTERVAL) {
                setSource();
                spread();
                if (preRef.current) preRef.current.textContent = render();
                last = time;
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    cancelAnimationFrame(rafRef.current);
                }
            },
            { threshold: 0 },
        );

        if (preRef.current) observer.observe(preRef.current);

        return () => {
            cancelAnimationFrame(rafRef.current);
            observer.disconnect();
        };
    }, []);

    return (
        <pre
            ref={preRef}
            className="font-mono text-[11px] leading-[1.15] select-none text-muted-foreground/55 [[data-theme='light']_&]:text-foreground/40 whitespace-pre"
            aria-hidden="true"
            style={{ minWidth: `${FIRE_W}ch` }}
        />
    );
}

const PAGES_ALL_LINKS = [
    { label: 'Home', href: '/#banner' },
    { label: 'About Me', href: '/#about-me' },
    { label: 'Projects', href: '/projects' },
    { label: 'Experience', href: '/#my-experience' },
    { label: 'Stack', href: '/#my-stack' },
    { label: 'Certifications', href: '/#certifications' },
    { label: 'Contact', href: '/#contact' },
];

const PENDING_HASH_KEY = 'pending-home-hash';

const Footer = () => {
    const lenis = useLenis();
    const router = useRouter();
    const pathname = usePathname();

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
            window.innerWidth >= 768 &&
            !!document.querySelector('.horizontal-mode');
        if (isHorizontalMode) {
            const root = document.querySelector(
                '.horizontal-mode',
            ) as HTMLElement | null;
            const track = root?.firstElementChild as HTMLElement | null;
            const panel = target.closest(
                '.horizontal-panel',
            ) as HTMLElement | null;
            if (!root || !track || !panel) {
                setTimeout(() => scrollToElement(target), 120);
                return;
            }
            const horizontalDistance = Math.max(
                0,
                track.scrollWidth - window.innerWidth,
            );
            const rootTop = root.getBoundingClientRect().top + window.scrollY;
            const panelRect = panel.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const sectionOffsetInsidePanel = Math.max(
                0,
                targetRect.left - panelRect.left,
            );
            const targetOffset = panel.offsetLeft + sectionOffsetInsidePanel;
            const panelOffset = Math.max(
                0,
                Math.min(horizontalDistance, targetOffset),
            );
            setTimeout(() => scrollToY(rootTop + panelOffset), 120);
            return;
        }
        setTimeout(() => scrollToElement(target), 120);
    };

    const navigateTo = (url: string) => {
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
        const hash = url.slice(1);
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
        window.sessionStorage.removeItem(PENDING_HASH_KEY);
        setTimeout(() => scrollToHash(pendingHash), 220);
    }, [pathname]);

    return (
        <footer
            className="border-t border-border bg-background"
            itemScope
            itemType="https://schema.org/Person"
            data-sprite-pass="true"
        >
            <div className="container pt-12 pb-6">
                {/* Link columns */}
                <div className="relative grid grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6 mb-16 sm:mb-20 md:flex md:gap-12 md:items-start md:justify-start">
                    <div className="order-1 text-left relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/65 mb-5">
                            Pages
                        </p>
                        <ul className="space-y-3.5">
                            {PAGES_ALL_LINKS.map((link) => (
                                <li key={`${link.label}-${link.href}`}>
                                    <button
                                        type="button"
                                        onClick={() => navigateTo(link.href)}
                                        className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="order-2 text-left relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/65 mb-5">
                            Connect
                        </p>
                        <ul className="space-y-3.5">
                            <li>
                                <a
                                    href={GENERAL_INFO.githubProfile}
                                    target="_blank"
                                    rel="noopener noreferrer me"
                                    className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide"
                                    itemProp="sameAs"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href={GENERAL_INFO.linkedinProfile}
                                    target="_blank"
                                    rel="noopener noreferrer me"
                                    className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide"
                                    itemProp="sameAs"
                                >
                                    LinkedIn
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${GENERAL_INFO.email}`}
                                    className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide"
                                    itemProp="email"
                                >
                                    Email
                                </a>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => navigateTo('/blog')}
                                    className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide"
                                >
                                    Blog
                                </button>
                            </li>
                        </ul>

                        {/* Mobile Location (directly below Connect) */}
                        <div className="mt-6 text-left md:hidden">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/65 mb-3">
                                Location
                            </p>
                            <address className="not-italic" itemProp="address">
                                <a
                                    href="https://www.google.com/search?q=Orlando%2C+FL&sourceid=chrome&ie=UTF-8"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-click-glow inline-block font-space-grotesk font-bold text-2xl text-foreground leading-none hover:text-primary [[data-theme='light']_&]:hover:text-zinc-900 transition-colors"
                                >
                                    Orlando, FL
                                </a>
                            </address>
                        </div>
                    </div>

                    <div className="hidden md:block order-3 col-span-1 text-right sm:text-left relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/65 mb-5">
                            Location
                        </p>
                        <address className="not-italic" itemProp="address">
                            <a
                                href="https://www.google.com/search?q=Orlando%2C+FL&sourceid=chrome&ie=UTF-8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-click-glow inline-block font-space-grotesk font-bold text-2xl text-foreground leading-none hover:text-primary [[data-theme='light']_&]:hover:text-zinc-900 transition-colors"
                            >
                                Orlando, FL
                            </a>
                        </address>
                    </div>

                    {/* Fireplace */}
                    <div className="order-4 col-span-2 absolute right-0 bottom-0 z-0 pointer-events-none flex justify-end">
                        <div className="block scale-90 md:scale-100 origin-right opacity-30 md:opacity-60">
                            <Campfire />
                        </div>
                    </div>
                </div>

                {/* ASCII name */}
                <div
                    className="-mx-4 sm:-mx-6 px-4 sm:px-6 mb-2 overflow-hidden"
                    data-sprite-obstacle="true"
                >
                    <pre
                        className="font-mono leading-snug whitespace-pre bg-clip-text text-transparent bg-gradient-to-l from-white/20 via-white/45 to-white/80 [[data-theme='light']_&]:from-black/60 [[data-theme='light']_&]:via-black/42 [[data-theme='light']_&]:to-black/25 mb-2"
                        style={{ fontSize: 'clamp(4.3px, 1.18vw, 16px)' }}
                        aria-label="@ 2026 ascii"
                    >{`   :::::::::::        ::::::::   :::::::   ::::::::   ::::::::
 :+: :+:+:+:+:+:            :+: :+:   :+:        :+: :+:    :+:
+:+ +:+   +:+ +:+          +:+  +:+  :+:+       +:+  +:+
+#+ +#+   +#+ +#+        +#+    +#+ + +#+     +#+    +#++:++#+
+#+ +#+   +#+ +#+      +#+      +#+#  +#+   +#+      +#+    +#+
 #+# #+#+#+#+#+       #+#       #+#   #+#  #+#       #+#    #+#
  #####              ##########  #######  ##########  ######## `}</pre>
                    <pre
                        className="font-mono leading-snug whitespace-pre bg-clip-text text-transparent bg-gradient-to-l from-white/20 via-white/45 to-white/80 [[data-theme='light']_&]:from-black/60 [[data-theme='light']_&]:via-black/42 [[data-theme='light']_&]:to-black/25"
                        style={{ fontSize: 'clamp(5.9px, 1.78vw, 24px)' }}
                        itemProp="name ascii"
                    >{`:::::::::::::: :::    :::    ::::     :::     ::: :::::::   :::       ::::::::::
     :+:       :+:    :+:   :+: :+:   :+:+:   :+: :+:  :+:  :+:       :+:
     +:+       +:+    +:+  +:+   +:+  :+:+:+  +:+ +:+       +:+       +:+
     +#+       +#++:++#++ +#++:++#++: +#+ +:+ +#+ :#:       +#+       +#++:++#
     +#+       +#+    +#+ +#+     +#+ +#+  #+#+#+ +#+ +#+#+ +#+       +#+
     #+#       #+#    #+# #+#     #+# #+#   #+#+# #+#  #+#  #+#       #+#
     ###       ###    ### ###     ### ###   ##### ########  ######### ##########`}</pre>
                </div>

                {/* Copyright */}
                <div className="border-t border-border/40 mt-4 pt-4 flex items-center justify-end md:border-t-0 md:pt-0 md:mt-0 md:-translate-y-8">
                    <p className="text-[11px] text-muted-foreground/55 [[data-theme='light']_&]:text-foreground/65 tracking-wide text-right">
                        All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
