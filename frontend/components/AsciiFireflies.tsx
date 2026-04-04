'use client';

import { useEffect, useRef } from 'react';

const CHARS = ["'", '.', '*', '`', '·', '✦', '+', '°'];
const COUNT = 55;
const FPS = 30;

type Fly = {
    x: number;   // 0–1 vw
    y: number;   // 0–1 vh
    vx: number;
    vy: number;
    char: string;
    opacity: number;
    targetOpacity: number;
    pulseTimer: number;
    pulseInterval: number;
    size: number;
};

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function makefly(): Fly {
    return {
        x: Math.random(),
        y: Math.random(),
        vx: rand(-0.00012, 0.00012),
        vy: rand(-0.00009, 0.00009),
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        opacity: 0,
        targetOpacity: rand(0.12, 0.35),
        pulseTimer: rand(0, 200),
        pulseInterval: rand(80, 220),
        size: Math.random() < 0.3 ? 18 : 15,
    };
}

export default function AsciiFireflies() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const fliesRef = useRef<Fly[]>([]);
    const rafRef = useRef(0);
    const lastRef = useRef(0);
    const nodeRef = useRef<HTMLSpanElement[]>([]);

    useEffect(() => {
        fliesRef.current = Array.from({ length: COUNT }, makefly);

        const container = canvasRef.current;
        if (!container) return;

        // Pre-create span elements — position: absolute inside the fixed container
        // so Lenis root transforms don't break fixed positioning
        nodeRef.current = fliesRef.current.map((fly) => {
            const span = document.createElement('span');
            span.textContent = fly.char;
            span.style.cssText = `
                position: absolute;
                pointer-events: none;
                user-select: none;
                font-family: ui-monospace, monospace;
                font-size: ${fly.size}px;
                line-height: 1;
                top: 0;
                left: 0;
                opacity: 0;
                will-change: transform, opacity;
                color: currentColor;
            `;
            container.appendChild(span);
            return span;
        });

        const INTERVAL = 1000 / FPS;

        const tick = (time: number) => {
            if (time - lastRef.current >= INTERVAL) {
                lastRef.current = time;
                const flies = fliesRef.current;
                const W = window.innerWidth;
                const H = window.innerHeight;

                for (let i = 0; i < flies.length; i++) {
                    const f = flies[i];
                    const el = nodeRef.current[i];

                    // Move
                    f.x += f.vx;
                    f.y += f.vy;

                    // Wrap around edges
                    if (f.x < -0.02) f.x = 1.02;
                    if (f.x > 1.02) f.x = -0.02;
                    if (f.y < -0.02) f.y = 1.02;
                    if (f.y > 1.02) f.y = -0.02;

                    // Gentle velocity drift
                    f.vx += rand(-0.000008, 0.000008);
                    f.vy += rand(-0.000006, 0.000006);
                    f.vx = Math.max(-0.00018, Math.min(0.00018, f.vx));
                    f.vy = Math.max(-0.00014, Math.min(0.00014, f.vy));

                    // Pulse opacity
                    f.pulseTimer += 1;
                    if (f.pulseTimer >= f.pulseInterval) {
                        f.pulseTimer = 0;
                        f.pulseInterval = rand(80, 220);
                        const isOn = f.targetOpacity > 0.01;
                        f.targetOpacity = isOn ? 0 : rand(0.10, 0.32);
                        if (!isOn) {
                            f.char = CHARS[Math.floor(Math.random() * CHARS.length)];
                            el.textContent = f.char;
                        }
                    }

                    // Lerp opacity
                    f.opacity += (f.targetOpacity - f.opacity) * 0.045;

                    // Apply to DOM — px values relative to the fixed container
                    el.style.transform = `translate(${(f.x * W).toFixed(1)}px, ${(f.y * H).toFixed(1)}px)`;
                    el.style.opacity = f.opacity.toFixed(3);
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            nodeRef.current.forEach((n) => n.remove());
        };
    }, []);

    return (
        <div
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-0 text-foreground overflow-hidden"
            aria-hidden="true"
        />
    );
}
