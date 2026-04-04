'use client';

import { useEffect, useRef } from 'react';

const CHARS = ["'", '.', '*', '`', '·', '+', '°', '✦'];
const COUNT = 55;
const FPS = 30;

type Fly = {
    x: number;
    y: number;
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

function makeFly(W: number, H: number): Fly {
    return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: rand(-0.22, 0.22),
        vy: rand(-0.16, 0.16),
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        opacity: 0,
        targetOpacity: rand(0.12, 0.38),
        pulseTimer: rand(0, 200),
        pulseInterval: rand(80, 220),
        size: Math.random() < 0.3 ? 18 : 15,
    };
}

export default function AsciiFireflies() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fliesRef = useRef<Fly[]>([]);
    const rafRef = useRef(0);
    const lastRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        fliesRef.current = Array.from({ length: COUNT }, () =>
            makeFly(window.innerWidth, window.innerHeight),
        );

        const INTERVAL = 1000 / FPS;

        const tick = (time: number) => {
            if (time - lastRef.current >= INTERVAL) {
                lastRef.current = time;

                const W = canvas.width;
                const H = canvas.height;
                ctx.clearRect(0, 0, W, H);

                for (const f of fliesRef.current) {
                    // Move
                    f.x += f.vx;
                    f.y += f.vy;

                    // Wrap
                    if (f.x < -20) f.x = W + 20;
                    if (f.x > W + 20) f.x = -20;
                    if (f.y < -20) f.y = H + 20;
                    if (f.y > H + 20) f.y = -20;

                    // Subtle drift
                    f.vx += rand(-0.003, 0.003);
                    f.vy += rand(-0.002, 0.002);
                    f.vx = Math.max(-0.3, Math.min(0.3, f.vx));
                    f.vy = Math.max(-0.22, Math.min(0.22, f.vy));

                    // Pulse
                    f.pulseTimer += 1;
                    if (f.pulseTimer >= f.pulseInterval) {
                        f.pulseTimer = 0;
                        f.pulseInterval = rand(80, 220);
                        const isOn = f.targetOpacity > 0.01;
                        f.targetOpacity = isOn ? 0 : rand(0.10, 0.38);
                        if (!isOn) {
                            f.char = CHARS[Math.floor(Math.random() * CHARS.length)];
                        }
                    }

                    // Lerp opacity
                    f.opacity += (f.targetOpacity - f.opacity) * 0.045;

                    // Draw
                    ctx.globalAlpha = f.opacity;
                    ctx.font = `${f.size}px ui-monospace, monospace`;
                    ctx.fillStyle = 'currentColor';
                    ctx.fillText(f.char, f.x, f.y);
                }

                ctx.globalAlpha = 1;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-0 text-foreground"
            style={{ color: 'var(--foreground)' }}
            aria-hidden="true"
        />
    );
}
