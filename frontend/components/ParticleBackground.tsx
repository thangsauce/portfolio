'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(useGSAP);

const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 150;

const ParticleBackground = () => {
    const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const rafRef = useRef<number>(0);
    const quickToXRef = useRef<((val: number) => void)[]>([]);

    useGSAP(() => {
        particlesRef.current.forEach((particle, i) => {
            if (!particle) return;
            const goesUp  = Math.random() > 0.5;
            const duration = Math.random() * 12 + 8;
            const travel   = window.innerHeight + 20;
            const startY   = Math.random() * window.innerHeight;

            gsap.set(particle, {
                width:   Math.random() * 3 + 1,
                height:  Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                left:    Math.random() * window.innerWidth,
                top:     goesUp ? window.innerHeight : -10,
            });

            const initialProgress = goesUp
                ? (window.innerHeight - startY) / travel
                : (startY + 10) / travel;

            const tween = gsap.to(particle, {
                y:        goesUp ? -travel : travel,
                duration,
                repeat:   -1,
                ease:     'none',
                paused:   true,
                onRepeat: () => {
                    gsap.set(particle, {
                        left:    Math.random() * window.innerWidth,
                        opacity: Math.random() * 0.5 + 0.2,
                    });
                },
            });

            tween.progress(initialProgress).resume();

            // quickTo is designed for high-frequency updates (mouse/scroll driven)
            quickToXRef.current[i] = gsap.quickTo(particle, 'x', {
                duration: 0.4,
                ease: 'power2.out',
            });
        });
    }, []);

    useEffect(() => {
        // Repulsion is desktop-only — skip on touch devices
        const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        if (isTouch) return;

        function onMouseMove(e: MouseEvent) {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        }
        function onMouseLeave() {
            mouseRef.current = { x: -9999, y: -9999 };
        }
        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);

        function tick() {
            const { x: mx, y: my } = mouseRef.current;

            particlesRef.current.forEach((particle, i) => {
                if (!particle || !quickToXRef.current[i]) return;

                const rect = particle.getBoundingClientRect();
                const px = rect.left + rect.width / 2;
                const py = rect.top + rect.height / 2;

                const dx = px - mx;
                const dy = py - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < REPULSION_RADIUS && dist > 0) {
                    const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH;
                    const angle = Math.atan2(dy, dx);
                    quickToXRef.current[i](Math.cos(angle) * force);
                } else {
                    quickToXRef.current[i](0);
                }
            });

            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {[...Array(200)].map((_, i) => (
                <div
                    key={i}
                    ref={(el) => {
                        particlesRef.current[i] = el;
                    }}
                    className="absolute rounded-full bg-black dark:bg-white"
                />
            ))}
        </div>
    );
};

export default ParticleBackground;
