'use client';
import { GENERAL_INFO } from '@/lib/data';
import TransitionLink from '@/components/TransitionLink';
import { useLenis } from 'lenis/react';
import { usePathname, useRouter } from 'next/navigation';

const SECTION_LINKS = [
    { label: 'Home', href: '/#banner' },
    { label: 'About Me', href: '/#about-me' },
    { label: 'Projects', href: '/#selected-projects' },
    { label: 'Experience', href: '/#my-experience' },
    { label: 'Stack', href: '/#my-stack' },
    { label: 'Certifications', href: '/#certifications' },
    { label: 'Contact', href: '/#contact' },
];

const PAGE_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
];

const PENDING_HASH_KEY = 'pending-home-hash';

const Footer = () => {
    const year = new Date().getFullYear();
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

    return (
        <footer
            className="border-t border-border bg-background"
            itemScope
            itemType="https://schema.org/Person"
        >
            <div className="container pt-12 pb-6">
                {/* Link columns */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 mb-16 sm:mb-20 md:flex md:gap-16">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/65 mb-5">
                            Pages
                        </p>
                        <ul className="space-y-3.5">
                            {PAGE_LINKS.map((link) => (
                                <li key={link.href}>
                                    <TransitionLink
                                        href={link.href}
                                        className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide"
                                    >
                                        {link.label}
                                    </TransitionLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/65 mb-5">
                            Sections
                        </p>
                        <ul className="space-y-3.5">
                            {SECTION_LINKS.map((link) => (
                                <li key={link.href}>
                                    <button
                                        type="button"
                                        onClick={() => navigateTo(link.href)}
                                        className="no-click-glow text-sm text-muted-foreground [[data-theme='light']_&]:text-foreground/75 hover:text-foreground transition-colors tracking-wide text-left"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
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
                            <li className="pt-1">
                                <address
                                    className="not-italic"
                                    itemProp="address"
                                >
                                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/50 [[data-theme='light']_&]:text-foreground/70">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="11"
                                            height="11"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                        <span className="text-[10px] uppercase tracking-[0.18em]">
                                            Location
                                        </span>
                                    </span>
                                    <p className="font-space-grotesk font-bold text-2xl text-foreground mt-0.5 leading-none">
                                        Orlando, FL
                                    </p>
                                </address>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ASCII name */}
                <div
                    className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2"
                    aria-hidden="true"
                >
                    <pre
                        className="font-mono leading-snug select-none whitespace-pre bg-clip-text text-transparent bg-gradient-to-l from-white/20 via-white/45 to-white/80 [[data-theme='light']_&]:from-black/60 [[data-theme='light']_&]:via-black/42 [[data-theme='light']_&]:to-black/25"
                        style={{ fontSize: 'clamp(7px, 2.1vw, 24px)' }}
                        itemProp="name"
                    >{`:::::::::::::: :::    :::    ::::     :::     ::: :::::::    :::       ::::::::::
     :+:       :+:    :+:   :+: :+:   :+:+:   :+: :+:  :+:   :+:       :+:
     +:+       +:+    +:+  +:+   +:+  :+:+:+  +:+ +:+        +:+       +:+
     +#+       +#++:++#++ +#++:++#++: +#+ +:+ +#+ :#:        +#+       +#++:++#
     +#+       +#+    +#+ +#+     +#+ +#+  #+#+#+ +#+ +#+#+  +#+       +#+
     #+#       #+#    #+# #+#     #+# #+#   #+#+# #+#  #+#   #+#       #+#
     ###       ###    ### ###     ### ###   ##### ########   ######### ##########`}</pre>
                </div>

                {/* Copyright */}
                <div className="border-t border-border/40 mt-4 pt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <p className="text-[11px] text-muted-foreground/55 [[data-theme='light']_&]:text-foreground/65 tracking-wide">
                            © {year} Thang Le. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
