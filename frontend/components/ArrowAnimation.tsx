import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

const ArrowAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLSpanElement>(null);
    const chevronRef = useRef<SVGPathElement>(null);

    useGSAP(() => {
        gsap.set(containerRef.current, { autoAlpha: 0 });
        gsap.set(chevronRef.current, {
            strokeDasharray: chevronRef.current?.getTotalLength(),
            strokeDashoffset: chevronRef.current?.getTotalLength(),
        });

        const tl = gsap.timeline({ repeat: -1 });
        tl.to(containerRef.current, { autoAlpha: 1, duration: 0.25 });
        tl.fromTo(
            dotRef.current,
            { y: 0, opacity: 1 },
            { y: 12, opacity: 0.35, duration: 1, ease: 'power2.inOut' },
            0,
        );
        tl.to(
            chevronRef.current,
            {
                strokeDashoffset: 0,
                duration: 0.7,
                ease: 'power2.out',
            },
            0.1,
        );
        tl.to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.35,
            delay: 1,
        });
    });

    return (
        <div
            ref={containerRef}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-0 pointer-events-none flex flex-col items-center gap-2 text-foreground/70"
        >
            <div className="relative h-16 w-10 rounded-full border border-primary/50 bg-background/20">
                <span
                    ref={dotRef}
                    className="absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary"
                />
            </div>
            <svg
                width="22"
                height="14"
                viewBox="0 0 22 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    ref={chevronRef}
                    d="M1 2L11 12L21 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default ArrowAnimation;
