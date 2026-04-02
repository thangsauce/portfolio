'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
    children: React.ReactNode;
};

const HorizontalScrollLayout = ({ children }: Props) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const panels = useMemo(() => React.Children.toArray(children), [children]);
    const scrollStateKey = 'portfolio:home:scrollY';

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const restore = () => {
            const raw = window.sessionStorage.getItem(scrollStateKey);
            const saved = raw ? Number(raw) : 0;
            if (Number.isFinite(saved) && saved > 0) {
                window.scrollTo({ top: saved, left: 0, behavior: 'auto' });
                requestAnimationFrame(() => {
                    window.scrollTo({ top: saved, left: 0, behavior: 'auto' });
                    ScrollTrigger.refresh();
                });
            }
        };

        const save = () => {
            window.sessionStorage.setItem(scrollStateKey, String(window.scrollY));
        };

        const timer = window.setTimeout(restore, 40);
        window.addEventListener('beforeunload', save);
        window.addEventListener('pagehide', save);

        return () => {
            window.clearTimeout(timer);
            save();
            window.removeEventListener('beforeunload', save);
            window.removeEventListener('pagehide', save);
        };
    }, []);

    useGSAP(
        () => {
            const root = rootRef.current;
            const track = trackRef.current;
            if (!root || !track) return;

            const mm = gsap.matchMedia();
            mm.add('(min-width: 768px)', () => {
                gsap.set(track, { x: 0 });
                const horizontalDistance = () =>
                    Math.max(0, track.scrollWidth - window.innerWidth);

                if (horizontalDistance() <= 0) return;

                const tween = gsap.to(track, {
                    x: () => -horizontalDistance(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: root,
                        start: 'top top',
                        end: () => `+=${horizontalDistance()}`,
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });

                const parallaxTweens: gsap.core.Tween[] = [];
                const panelEls = gsap.utils.toArray<HTMLElement>(
                    track.querySelectorAll('.horizontal-panel'),
                );

                panelEls.forEach((panel) => {
                    const content = panel.querySelector<HTMLElement>('.horizontal-panel-content');
                    if (!content) return;
                    const target = content.querySelector<HTMLElement>('.container') ?? content;

                    const parallaxTween = gsap.fromTo(
                        target,
                        { xPercent: -12 },
                        {
                            xPercent: 12,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: tween,
                                start: 'left right',
                                end: 'right left',
                                scrub: 1,
                                invalidateOnRefresh: true,
                            },
                        },
                    );
                    parallaxTweens.push(parallaxTween);
                });

                return () => {
                    parallaxTweens.forEach((pt) => {
                        pt.scrollTrigger?.kill();
                        pt.kill();
                    });
                    tween.scrollTrigger?.kill();
                    tween.kill();
                };
            });

            mm.add('(max-width: 767px)', () => {
                const mobileParallaxTweens: gsap.core.Tween[] = [];
                const panelEls = gsap.utils.toArray<HTMLElement>(
                    track.querySelectorAll('.horizontal-panel'),
                );

                panelEls.forEach((panel) => {
                    const content = panel.querySelector<HTMLElement>('.horizontal-panel-content');
                    if (!content) return;
                    const target =
                        content.querySelector<HTMLElement>('.page-') ??
                        content.querySelector<HTMLElement>('.container') ??
                        content;

                    const parallaxTween = gsap.fromTo(
                        target,
                        { yPercent: 14, scale: 0.985 },
                        {
                            yPercent: -14,
                            scale: 1.015,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: panel,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: 1,
                                invalidateOnRefresh: true,
                            },
                        },
                    );
                    mobileParallaxTweens.push(parallaxTween);
                });

                return () => {
                    mobileParallaxTweens.forEach((pt) => {
                        pt.scrollTrigger?.kill();
                        pt.kill();
                    });
                };
            });

            return () => mm.revert();
        },
        { scope: rootRef, dependencies: [panels.length] },
    );

    return (
        <div ref={rootRef} className="horizontal-mode relative md:overflow-hidden">
            <div ref={trackRef} className="flex flex-col md:w-max md:flex-row">
                {panels.map((panel, idx) => (
                    <div
                        key={idx}
                        className="horizontal-panel w-full shrink-0 md:w-screen md:min-h-[100svh]"
                    >
                        <div className={`horizontal-panel-content md:will-change-transform ${idx === 0 ? '' : 'md:pt-20 md:pl-20 lg:pt-24 lg:pl-28 xl:pt-32 xl:pl-36'}`}>
                            {panel}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalScrollLayout;
