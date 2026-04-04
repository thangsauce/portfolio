'use client';

import { useMemo } from 'react';

const CHARS = ["'", '.', '*', '`', '·', '+', '°', '✦'];

type Firefly = {
    left: number;
    top: number;
    size: number;
    char: string;
    delay: number;
    twinkleDuration: number;
    driftDuration: number;
    driftX: number;
    driftY: number;
};

function seeded(index: number, step: number) {
    const x = Math.sin(index * 97.131 + step * 23.917) * 10000;
    return x - Math.floor(x);
}

export default function PanelFireflies({ seed = 0 }: { seed?: number }) {
    const flies = useMemo<Firefly[]>(() => {
        const count = 22;
        const out: Firefly[] = [];
        for (let i = 0; i < count; i += 1) {
            const r1 = seeded(seed + i, 1);
            const r2 = seeded(seed + i, 2);
            const r3 = seeded(seed + i, 3);
            const r4 = seeded(seed + i, 4);
            const r5 = seeded(seed + i, 5);
            const r6 = seeded(seed + i, 6);
            const r7 = seeded(seed + i, 7);
            out.push({
                left: 6 + r1 * 88,
                top: 8 + r2 * 80,
                size: r3 > 0.7 ? 18 : 15,
                char: CHARS[Math.floor(r4 * CHARS.length)],
                delay: -r5 * 3.2,
                twinkleDuration: 2.6 + r1 * 2.2,
                driftDuration: 6.8 + r2 * 5.4,
                driftX: (r6 - 0.5) * 14,
                driftY: (r7 - 0.5) * 10,
            });
        }
        return out;
    }, [seed]);

    return (
        <div className="panel-fireflies" aria-hidden="true">
            {flies.map((f, idx) => (
                <span
                    key={`${seed}-${idx}`}
                    className="panel-firefly"
                    style={{
                        left: `${f.left}%`,
                        top: `${f.top}%`,
                        fontSize: `${f.size}px`,
                        ['--tw-delay' as string]: `${f.delay}s`,
                        ['--tw-duration' as string]: `${f.twinkleDuration}s`,
                        ['--dr-duration' as string]: `${f.driftDuration}s`,
                        ['--dx' as string]: `${f.driftX}px`,
                        ['--dy' as string]: `${f.driftY}px`,
                    }}
                >
                    {f.char}
                </span>
            ))}

            <style jsx>{`
                .panel-fireflies {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .panel-firefly {
                    position: absolute;
                    color: hsl(var(--foreground));
                    opacity: 0.08;
                    text-shadow: 0 0 4px currentColor;
                    animation:
                        fireflyTwinkle var(--tw-duration, 3.2s) ease-in-out var(--tw-delay, 0s) infinite,
                        fireflyDrift var(--dr-duration, 9s) ease-in-out 0s infinite alternate;
                    will-change: transform, opacity;
                }
                :global([data-theme='light']) .panel-firefly {
                    opacity: 0.12;
                }
                @keyframes fireflyTwinkle {
                    0%,
                    100% {
                        opacity: 0.06;
                    }
                    50% {
                        opacity: 0.24;
                    }
                }
                @keyframes fireflyDrift {
                    0% {
                        transform: translate3d(0, 0, 0);
                    }
                    100% {
                        transform: translate3d(var(--dx, 8px), var(--dy, 6px), 0);
                    }
                }
            `}</style>
        </div>
    );
}
