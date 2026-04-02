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

    useEffect(() => {
        if (window.innerWidth >= 768) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
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
                    const target = content.querySelector<HTMLElement>('.container') ?? content;

                    const parallaxTween = gsap.fromTo(
                        target,
                        { yPercent: 8 },
                        {
                            yPercent: -8,
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
