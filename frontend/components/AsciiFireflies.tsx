'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useState } from 'react';

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

function FireflyCanvas() {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
            pointer-events: none;
            width: 100%;
        `;
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            const doc = document.documentElement;
            const body = document.body;
            const width = Math.max(window.innerWidth, doc.clientWidth, body.scrollWidth);
            const height = Math.max(
                window.innerHeight,
                doc.scrollHeight,
                body.scrollHeight,
            );
            canvas.width = width;
            canvas.height = height;
            canvas.style.height = `${height}px`;
        };
        resize();
        window.addEventListener('resize', resize);

        let fgColor = '#ffffff';
        const resolveColor = () => {
            const raw = getComputedStyle(document.documentElement)
                .getPropertyValue('--foreground')
                .trim();
            fgColor = raw ? `hsl(${raw})` : '#ffffff';
        };
        resolveColor();
        const themeObserver = new MutationObserver(resolveColor);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        const flies: Fly[] = Array.from({ length: COUNT }, () =>
            makeFly(window.innerWidth, window.innerHeight),
        );

        let last = 0;
        let raf = 0;
        const INTERVAL = 1000 / FPS;

        const tick = (time: number) => {
            if (time - last >= INTERVAL) {
                last = time;
                const W = canvas.width;
                const H = canvas.height;
                ctx.clearRect(0, 0, W, H);
                ctx.fillStyle = fgColor;

                for (const f of flies) {
                    f.x += f.vx;
                    f.y += f.vy;

                    if (f.x < -20) f.x = W + 20;
                    if (f.x > W + 20) f.x = -20;
                    if (f.y < -20) f.y = H + 20;
                    if (f.y > H + 20) f.y = -20;

                    f.vx += rand(-0.003, 0.003);
                    f.vy += rand(-0.002, 0.002);
                    f.vx = Math.max(-0.3, Math.min(0.3, f.vx));
                    f.vy = Math.max(-0.22, Math.min(0.22, f.vy));

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

                    f.opacity += (f.targetOpacity - f.opacity) * 0.045;

                    ctx.globalAlpha = f.opacity;
                    ctx.font = `${f.size}px ui-monospace, monospace`;
                    ctx.fillText(f.char, f.x, f.y);
                }

                ctx.globalAlpha = 1;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            themeObserver.disconnect();
            canvas.remove();
        };
    }, []);

    return null;
}

export default function AsciiFireflies() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return createPortal(<FireflyCanvas />, document.body);
}
