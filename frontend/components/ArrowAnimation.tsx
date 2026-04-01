import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(useGSAP);

const ArrowAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLSpanElement>(null);
    const chevronsRef = useRef<SVGSVGElement>(null);

    useGSAP(() => {
        gsap.set(containerRef.current, { autoAlpha: 1 });

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });
        tl.fromTo(
            dotRef.current,
            { x: 0, opacity: 1 },
            { x: 42, opacity: 0.45, duration: 0.9, ease: 'power2.inOut' },
            0,
        );
        tl.fromTo(
            chevronsRef.current,
            { x: 0, opacity: 0.45 },
            { x: 8, opacity: 1, duration: 0.45, ease: 'power2.out' },
            0.08,
        );
        tl.to(
            chevronsRef.current,
            { x: 0, opacity: 0.45, duration: 0.45, ease: 'power2.inOut' },
            0.52,
        );
    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="absolute top-1/2 right-10 -translate-y-1/2 z-0 pointer-events-none flex items-center gap-4 text-foreground/70"
        >
            <div className="relative h-12 w-24 rounded-full border-2 border-primary/60 bg-background/25">
                <span
                    ref={dotRef}
                    className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-primary"
                />
            </div>
            <svg
                ref={chevronsRef}
                width="42"
                height="24"
                viewBox="0 0 42 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M4 3L16 12L4 21M16 3L28 12L16 21M28 3L40 12L28 21"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default ArrowAnimation;
