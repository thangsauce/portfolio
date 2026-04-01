import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

type ArrowAnimationProps = {
    mobileClassName?: string;
    desktopClassName?: string;
};

const ArrowAnimation = ({ mobileClassName, desktopClassName }: ArrowAnimationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const desktopDotRef = useRef<SVGGElement>(null);
    const desktopChevronsRef = useRef<SVGSVGElement>(null);
    const mobileDotRef = useRef<SVGGElement>(null);
    const mobileChevronsRef = useRef<SVGSVGElement>(null);

    useGSAP(() => {
        gsap.set(containerRef.current, { autoAlpha: 1 });

        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
            tl.fromTo(
                desktopDotRef.current,
                { x: 0, opacity: 1 },
                { x: 42, opacity: 0.45, duration: 1.9, ease: 'power2.inOut' },
                0,
            );
            tl.fromTo(
                desktopChevronsRef.current,
                { x: 0, opacity: 0.45 },
                { x: 8, opacity: 1, duration: 1.05, ease: 'power2.out' },
                0.2,
            );
            tl.to(
                desktopChevronsRef.current,
                { x: 0, opacity: 0.45, duration: 1.05, ease: 'power2.inOut' },
                1.35,
            );
        });

        mm.add('(max-width: 767px)', () => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
            tl.fromTo(
                mobileDotRef.current,
                { y: 0, opacity: 1 },
                { y: 30, opacity: 0.45, duration: 1.9, ease: 'power2.inOut' },
                0,
            );
            tl.fromTo(
                mobileChevronsRef.current,
                { y: 0, opacity: 0.45 },
                { y: 7, opacity: 1, duration: 1.05, ease: 'power2.out' },
                0.2,
            );
            tl.to(
                mobileChevronsRef.current,
                { y: 0, opacity: 0.45, duration: 1.05, ease: 'power2.inOut' },
                1.35,
            );
        });

        return () => mm.revert();
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="z-[4] pointer-events-none text-foreground/70">
            <div className={cn('md:hidden absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3', mobileClassName)}>
                <svg
                    width="56"
                    height="96"
                    viewBox="0 0 56 96"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M28 6V70"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.35"
                    />
                    <g ref={mobileDotRef}>
                        <circle cx="28" cy="16" r="4.5" fill="currentColor" className="text-primary" />
                    </g>
                </svg>
                <svg
                    ref={mobileChevronsRef}
                    width="30"
                    height="42"
                    viewBox="0 0 30 42"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4 4L15 16L26 4M4 16L15 28L26 16M4 28L15 40L26 28"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div className={cn('hidden md:flex absolute top-1/2 right-10 -translate-y-1/2 items-center gap-4', desktopClassName)}>
                <svg
                    width="96"
                    height="56"
                    viewBox="0 0 96 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 28H70"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.35"
                    />
                    <g ref={desktopDotRef}>
                        <circle cx="16" cy="28" r="4.5" fill="currentColor" className="text-primary" />
                    </g>
                </svg>
                <svg
                    ref={desktopChevronsRef}
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
        </div>
    );
};

export default ArrowAnimation;
