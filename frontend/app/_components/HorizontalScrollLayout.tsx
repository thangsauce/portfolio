'use client';

import React, { useMemo, useRef } from 'react';
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

    useGSAP(
        () => {
            const root = rootRef.current;
            const track = trackRef.current;
            if (!root || !track) return;

            const mm = gsap.matchMedia();
            mm.add('(min-width: 1024px)', () => {
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

                const panelElements = gsap.utils.toArray<HTMLElement>('.horizontal-panel');
                panelElements.forEach((panel) => {
                    const content = panel.querySelector<HTMLElement>('.horizontal-panel-content');
                    if (!content) return;
                    gsap.set(content, { autoAlpha: 1, y: 0 });

                    ScrollTrigger.create({
                        trigger: panel,
                        containerAnimation: tween,
                        start: 'left center',
                        end: 'right center',
                        onEnter: () => {
                            gsap.fromTo(
                                content,
                                { autoAlpha: 0, y: 150 },
                                { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', overwrite: true },
                            );
                        },
                        onEnterBack: () => {
                            gsap.fromTo(
                                content,
                                { autoAlpha: 0, y: 150 },
                                { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', overwrite: true },
                            );
                        },
                        onLeave: () => {
                            gsap.to(content, {
                                autoAlpha: 0,
                                y: -150,
                                duration: 0.6,
                                ease: 'power2.in',
                                overwrite: true,
                            });
                        },
                        onLeaveBack: () => {
                            gsap.to(content, {
                                autoAlpha: 0,
                                y: -150,
                                duration: 0.6,
                                ease: 'power2.in',
                                overwrite: true,
                            });
                        },
                    });
                });

                return () => {
                    ScrollTrigger.getAll().forEach((st) => {
                        if (st.vars.containerAnimation === tween) st.kill();
                    });
                    tween.scrollTrigger?.kill();
                    tween.kill();
                };
            });

            return () => mm.revert();
        },
        { scope: rootRef, dependencies: [panels.length] },
    );

    return (
        <div ref={rootRef} className="horizontal-mode relative lg:overflow-hidden">
            <div ref={trackRef} className="flex flex-col lg:w-max lg:flex-row">
                {panels.map((panel, idx) => (
                    <div
                        key={idx}
                        className="horizontal-panel w-full shrink-0 lg:w-screen lg:min-h-[100svh]"
                    >
                        <div className={`horizontal-panel-content ${idx === 0 ? '' : 'lg:pt-24 xl:pt-32'}`}>
                            {panel}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalScrollLayout;
