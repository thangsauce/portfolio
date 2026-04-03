'use client';

import { useEffect, useRef, useState } from 'react';

const WALK_SPRITE_SRC = '/sprite-walking.png';
const RUN_SPRITE_SRC = '/sprite-running.png';
const IDLE_SPRITE_SRC = '/sprite-idling.png';
const JUMP_SPRITE_SRC = '/sprite-jumping.png';
const DUCK_SPRITE_SRC = '/sprite-ducking.png';
const BLOWN_SPRITE_SRC = '/sprite-blown-away.png';
const FLY_SPRITE_SRC = '/sprite-flying.png';
const FALL_SPRITE_SRC = '/sprite-falling-down.png';
const SPRITE_FRAMES = 6;
const DEFAULT_FRAME_W = 84;
const DEFAULT_FRAME_H = 84;
const SPRITE_SCALE = 0.52;
const FLOOR_OFFSET = 0;
const WALK_SPEED = 4.2;
const RUN_SPEED = 6.2;
const GRAVITY = 0.7;
const JUMP_VELOCITY = 12;
const RUN_TRIGGER_MS = 700;
const WALK_FRAME_STEP_MS = 90;
const RUN_FRAME_STEP_MS = 70;
const IDLE_FRAME_STEP_MS = 140;
const JUMP_FRAME_STEP_MS = 95;
const DUCK_FRAME_STEP_MS = 110;
const BLOWN_FRAME_STEP_MS = 85;
const FLY_FRAME_STEP_MS = 80;
const FALL_FRAME_STEP_MS = 95;
const BLOWN_ACTIVE_MS = 260;
const FLY_SPEED_X = 4.7;
const FLY_SPEED_Y = 4.7;
const FLY_SAFE_INSET_PX = 5;
const RUN_FRAME_INSET_LEFT_PX = 12;
const RUN_FRAME_INSET_RIGHT_PX = 3;
const JUMP_FRAME_INSET_LEFT_PX = 8;
const JUMP_FRAME_INSET_RIGHT_PX = 1;
const ALPHA_THRESHOLD = 10;
const FALL_SPRITE_COLS = 2;
const FALL_SPRITE_ROWS = 3;
const BLOWN_SPRITE_COLS = 2;
const BLOWN_SPRITE_ROWS = 3;
const BLOWN_RENDER_WIDTH_MULT = 1.9;
const BLOWN_BOUND_PAD_X = 28;
const BLOWN_BOUND_PAD_Y = 10;
const IDLE_SPRITE_COLS = 4;
const IDLE_SPRITE_ROWS = 2;
const IDLE_SPRITE_FRAMES = IDLE_SPRITE_COLS * IDLE_SPRITE_ROWS;
const BLOWN_SPRITE_FRAMES = BLOWN_SPRITE_COLS * BLOWN_SPRITE_ROWS;
const FALL_SPRITE_FRAMES = FALL_SPRITE_COLS * FALL_SPRITE_ROWS;

type SpriteKey =
    | 'walk'
    | 'run'
    | 'idle'
    | 'jump'
    | 'duck'
    | 'blown'
    | 'fly'
    | 'fall';

type SpriteMeta = {
    img: HTMLImageElement | null;
    frameW: number;
    frameH: number;
    frameBounds?: Array<{ sx: number; sy: number; sw: number; sh: number }>;
};

function computeFrameAlphaBounds(
    img: HTMLImageElement,
    frames: number,
    cellInset = 0,
): Array<{ sx: number; sy: number; sw: number; sh: number }> | undefined {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return undefined;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, w, h).data;
    const bounds: Array<{ sx: number; sy: number; sw: number; sh: number }> =
        [];

    for (let i = 0; i < frames; i += 1) {
        const cellStart = Math.round((i * w) / frames);
        const cellEnd = Math.round(((i + 1) * w) / frames);
        const cellW = Math.max(1, cellEnd - cellStart);
        // Pull the scan window in by cellInset on each side so tightly-packed
        // adjacent characters don't bleed during drawImage sub-pixel sampling.
        const scanStart = cellStart + cellInset;
        const scanEnd = cellEnd - cellInset;

        let minX = scanEnd;
        let maxX = scanStart - 1;
        let minY = h;
        let maxY = -1;

        for (let y = 0; y < h; y += 1) {
            for (let x = scanStart; x < scanEnd; x += 1) {
                const a = data[(y * w + x) * 4 + 3];
                if (a <= ALPHA_THRESHOLD) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        if (maxX < minX || maxY < minY) {
            bounds.push({ sx: cellStart, sy: 0, sw: cellW, sh: h });
            continue;
        }

        const pad = 1;
        const sx = Math.max(cellStart, minX - pad);
        const ex = Math.min(cellEnd - 1, maxX + pad);
        const sy = Math.max(0, minY - pad);
        const ey = Math.min(h - 1, maxY + pad);
        bounds.push({
            sx,
            sy,
            sw: Math.max(1, ex - sx + 1),
            sh: Math.max(1, ey - sy + 1),
        });
    }

    return bounds;
}

function computeComponentFrameBounds(
    img: HTMLImageElement,
    frameCount = SPRITE_FRAMES,
    rowMajor = false,
): Array<{ sx: number; sy: number; sw: number; sh: number }> | undefined {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return undefined;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);

    const image = ctx.getImageData(0, 0, w, h);
    const data = image.data;
    const visited = new Uint8Array(w * h);
    const comps: Array<{
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        area: number;
    }> = [];

    const idx = (x: number, y: number) => y * w + x;
    const alphaAt = (x: number, y: number) => data[idx(x, y) * 4 + 3];

    const qx = new Int32Array(w * h);
    const qy = new Int32Array(w * h);

    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const i = idx(x, y);
            if (visited[i]) continue;
            visited[i] = 1;
            if (alphaAt(x, y) <= ALPHA_THRESHOLD) continue;

            let head = 0;
            let tail = 0;
            qx[tail] = x;
            qy[tail] = y;
            tail += 1;

            let minX = x;
            let maxX = x;
            let minY = y;
            let maxY = y;
            let area = 0;

            while (head < tail) {
                const cx = qx[head];
                const cy = qy[head];
                head += 1;
                area += 1;
                if (cx < minX) minX = cx;
                if (cx > maxX) maxX = cx;
                if (cy < minY) minY = cy;
                if (cy > maxY) maxY = cy;

                const neighbors = [
                    [cx - 1, cy],
                    [cx + 1, cy],
                    [cx, cy - 1],
                    [cx, cy + 1],
                ] as const;
                for (const [nx, ny] of neighbors) {
                    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                    const ni = idx(nx, ny);
                    if (visited[ni]) continue;
                    visited[ni] = 1;
                    if (alphaAt(nx, ny) <= ALPHA_THRESHOLD) continue;
                    qx[tail] = nx;
                    qy[tail] = ny;
                    tail += 1;
                }
            }

            if (area >= 80) {
                comps.push({ minX, minY, maxX, maxY, area });
            }
        }
    }

    if (comps.length === 0) return undefined;

    const ordered = comps
        .sort((a, b) =>
            rowMajor
                ? a.minY === b.minY
                    ? a.minX - b.minX
                    : a.minY - b.minY
                : a.minX - b.minX,
        )
        .slice(0, frameCount);
    if (ordered.length !== frameCount) return undefined;

    const pad = 1;
    return ordered.map((c) => {
        const sx = Math.max(0, c.minX - pad);
        const sy = Math.max(0, c.minY - pad);
        const ex = Math.min(w - 1, c.maxX + pad);
        const ey = Math.min(h - 1, c.maxY + pad);
        return {
            sx,
            sy,
            sw: Math.max(1, ex - sx + 1),
            sh: Math.max(1, ey - sy + 1),
        };
    });
}

function computeSeededFrameBounds(
    img: HTMLImageElement,
    frames: number,
): Array<{ sx: number; sy: number; sw: number; sh: number }> | undefined {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return undefined;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);

    const image = ctx.getImageData(0, 0, w, h);
    const data = image.data;
    const idx = (x: number, y: number) => y * w + x;
    const alphaAt = (x: number, y: number) => data[idx(x, y) * 4 + 3];
    const qx = new Int32Array(w * h);
    const qy = new Int32Array(w * h);

    const findSeed = (cx: number, cy: number, r: number) => {
        let bestX = -1;
        let bestY = -1;
        let bestDist = Number.POSITIVE_INFINITY;
        const minX = Math.max(0, cx - r);
        const maxX = Math.min(w - 1, cx + r);
        const minY = Math.max(0, cy - r);
        const maxY = Math.min(h - 1, cy + r);
        for (let y = minY; y <= maxY; y += 1) {
            for (let x = minX; x <= maxX; x += 1) {
                if (alphaAt(x, y) <= ALPHA_THRESHOLD) continue;
                const dx = x - cx;
                const dy = y - cy;
                const d2 = dx * dx + dy * dy;
                if (d2 < bestDist) {
                    bestDist = d2;
                    bestX = x;
                    bestY = y;
                }
            }
        }
        return bestX >= 0 ? { x: bestX, y: bestY } : null;
    };

    const bounds: Array<{ sx: number; sy: number; sw: number; sh: number }> =
        [];
    const visited = new Uint8Array(w * h);

    for (let i = 0; i < frames; i += 1) {
        const cellStart = Math.round((i * w) / frames);
        const cellEnd = Math.round(((i + 1) * w) / frames);
        const cellW = Math.max(1, cellEnd - cellStart);
        const cx = Math.round((cellStart + cellEnd - 1) / 2);
        const cy = Math.round(h * 0.55);

        const seed =
            findSeed(cx, cy, Math.round(cellW * 0.45)) ??
            findSeed(cx, cy, Math.round(cellW * 0.9)) ??
            null;

        if (!seed) {
            bounds.push({ sx: cellStart, sy: 0, sw: cellW, sh: h });
            continue;
        }

        visited.fill(0);
        let head = 0;
        let tail = 0;
        qx[tail] = seed.x;
        qy[tail] = seed.y;
        tail += 1;
        visited[idx(seed.x, seed.y)] = 1;

        let minX = seed.x;
        let maxX = seed.x;
        let minY = seed.y;
        let maxY = seed.y;

        while (head < tail) {
            const x = qx[head];
            const y = qy[head];
            head += 1;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            const neighbors = [
                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1],
            ] as const;

            for (const [nx, ny] of neighbors) {
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                // Hard stop at cell walls — prevents flood-fill from leaking
                // into an adjacent character even if their pixels are touching.
                if (nx < cellStart || nx >= cellEnd) continue;
                if (alphaAt(nx, ny) <= ALPHA_THRESHOLD) continue;
                const ni = idx(nx, ny);
                if (visited[ni]) continue;
                visited[ni] = 1;
                qx[tail] = nx;
                qy[tail] = ny;
                tail += 1;
            }
        }

        const pad = 1;
        const sx = Math.max(cellStart, minX - pad);
        const sy = Math.max(0, minY - pad);
        const ex = Math.min(cellEnd - 1, maxX + pad);
        const ey = Math.min(h - 1, maxY + pad);
        bounds.push({
            sx,
            sy,
            sw: Math.max(1, ex - sx + 1),
            sh: Math.max(1, ey - sy + 1),
        });
    }

    return bounds;
}

function computeGridFrameAlphaBounds(
    img: HTMLImageElement,
    cols: number,
    rows: number,
): Array<{ sx: number; sy: number; sw: number; sh: number }> | undefined {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h || cols <= 0 || rows <= 0) return undefined;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, w, h).data;
    const bounds: Array<{ sx: number; sy: number; sw: number; sh: number }> =
        [];
    const total = cols * rows;

    for (let i = 0; i < total; i += 1) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellStartX = Math.round((col * w) / cols);
        const cellEndX = Math.round(((col + 1) * w) / cols);
        const cellStartY = Math.round((row * h) / rows);
        const cellEndY = Math.round(((row + 1) * h) / rows);
        const cellW = Math.max(1, cellEndX - cellStartX);
        const cellH = Math.max(1, cellEndY - cellStartY);

        let minX = cellEndX;
        let maxX = cellStartX - 1;
        let minY = cellEndY;
        let maxY = cellStartY - 1;

        for (let y = cellStartY; y < cellEndY; y += 1) {
            for (let x = cellStartX; x < cellEndX; x += 1) {
                const a = data[(y * w + x) * 4 + 3];
                if (a <= ALPHA_THRESHOLD) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        if (maxX < minX || maxY < minY) {
            bounds.push({
                sx: cellStartX,
                sy: cellStartY,
                sw: cellW,
                sh: cellH,
            });
            continue;
        }

        const pad = 1;
        const sx = Math.max(cellStartX, minX - pad);
        const ex = Math.min(cellEndX - 1, maxX + pad);
        const sy = Math.max(cellStartY, minY - pad);
        const ey = Math.min(cellEndY - 1, maxY + pad);
        bounds.push({
            sx,
            sy,
            sw: Math.max(1, ex - sx + 1),
            sh: Math.max(1, ey - sy + 1),
        });
    }

    return bounds;
}

const SpriteWalker = () => {
    const keysRef = useRef({
        left: false,
        right: false,
        down: false,
        up: false,
    });
    const jumpQueuedRef = useRef(false);
    const rafRef = useRef<number | null>(null);
    const lastFrameAtRef = useRef(0);
    const frameRef = useRef(0);
    const modeRef = useRef<
        'idle' | 'walk' | 'run' | 'air' | 'duck' | 'blown' | 'fly' | 'fall'
    >('idle');
    const moveHoldMsRef = useRef(0);
    const moveDirRef = useRef<0 | -1 | 1>(0);
    const lastTickRef = useRef(0);
    const scrollBurstUntilRef = useRef(0);
    const scrollDirRef = useRef<1 | -1>(1);
    const lastScrollYRef = useRef(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const spritesRef = useRef<Record<SpriteKey, SpriteMeta>>({
        walk: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        run: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        idle: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        jump: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        duck: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        blown: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        fly: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
        fall: {
            img: null,
            frameW: DEFAULT_FRAME_W,
            frameH: DEFAULT_FRAME_H,
            frameBounds: undefined,
        },
    });

    const xRef = useRef(24);
    const yRef = useRef(0);
    const vyRef = useRef(0);
    const facingRef = useRef<1 | -1>(1);

    const [x, setX] = useState(24);
    const [y, setY] = useState(0);
    const [facing, setFacing] = useState<1 | -1>(1);
    const [frame, setFrame] = useState(0);
    const [mode, setMode] = useState<
        'idle' | 'walk' | 'run' | 'air' | 'duck' | 'blown' | 'fly' | 'fall'
    >('idle');
    const [frameW, setFrameW] = useState(DEFAULT_FRAME_W);
    const [frameH, setFrameH] = useState(DEFAULT_FRAME_H);

    const playerW = Math.max(1, Math.round(frameW * SPRITE_SCALE));
    const playerH = Math.max(1, Math.round(frameH * SPRITE_SCALE));

    useEffect(() => {
        const loadSprite = (key: SpriteKey, src: string) => {
            const img = new Image();
            img.onload = () => {
                if (!img.naturalWidth || !img.naturalHeight) return;
                spritesRef.current[key] = {
                    img,
                    frameW:
                        key === 'fall'
                            ? img.naturalWidth / FALL_SPRITE_COLS
                            : key === 'blown'
                              ? img.naturalWidth / BLOWN_SPRITE_COLS
                              : key === 'idle'
                                ? img.naturalWidth / IDLE_SPRITE_COLS
                                : img.naturalWidth / SPRITE_FRAMES,
                    frameH:
                        key === 'fall'
                            ? img.naturalHeight / FALL_SPRITE_ROWS
                            : key === 'blown'
                              ? img.naturalHeight / BLOWN_SPRITE_ROWS
                              : key === 'idle'
                                ? img.naturalHeight / IDLE_SPRITE_ROWS
                                : img.naturalHeight,
                    frameBounds:
                        key === 'fly'
                            ? (computeSeededFrameBounds(img, SPRITE_FRAMES) ??
                              computeComponentFrameBounds(img) ??
                              computeFrameAlphaBounds(img, SPRITE_FRAMES))
                            : key === 'fall'
                              ? computeGridFrameAlphaBounds(
                                    img,
                                    FALL_SPRITE_COLS,
                                    FALL_SPRITE_ROWS,
                                )
                              : key === 'blown'
                                ? computeGridFrameAlphaBounds(
                                      img,
                                      BLOWN_SPRITE_COLS,
                                      BLOWN_SPRITE_ROWS,
                                  )
                                : key === 'run'
                                  ? (computeSeededFrameBounds(
                                        img,
                                        SPRITE_FRAMES,
                                    ) ??
                                    computeFrameAlphaBounds(img, SPRITE_FRAMES))
                                  : undefined,
                };

                // Use walk sprite as canonical display proportion.
                if (key === 'walk') {
                    setFrameW(img.naturalWidth / SPRITE_FRAMES);
                    setFrameH(img.naturalHeight);
                }
            };
            img.src = src;
        };

        loadSprite('walk', WALK_SPRITE_SRC);
        loadSprite('run', RUN_SPRITE_SRC);
        loadSprite('idle', IDLE_SPRITE_SRC);
        loadSprite('jump', JUMP_SPRITE_SRC);
        loadSprite('duck', DUCK_SPRITE_SRC);
        loadSprite('blown', BLOWN_SPRITE_SRC);
        loadSprite('fly', FLY_SPRITE_SRC);
        loadSprite('fall', FALL_SPRITE_SRC);
    }, []);

    useEffect(() => {
        const markScrollBurst = (dir: number) => {
            scrollDirRef.current = dir >= 0 ? 1 : -1;
            scrollBurstUntilRef.current = performance.now() + BLOWN_ACTIVE_MS;
        };

        const onWheel = (e: WheelEvent) => {
            const delta =
                Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (Math.abs(delta) < 0.5) return;
            markScrollBurst(delta);
        };

        const onScroll = () => {
            const y = window.scrollY;
            const dy = y - lastScrollYRef.current;
            lastScrollYRef.current = y;
            if (Math.abs(dy) < 0.5) return;
            markScrollBurst(dy);
        };

        lastScrollYRef.current = window.scrollY;
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        const isTypingTarget = (target: EventTarget | null) => {
            const el = target as HTMLElement | null;
            if (!el) return false;
            const tag = el.tagName.toLowerCase();
            return (
                tag === 'input' || tag === 'textarea' || el.isContentEditable
            );
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (isTypingTarget(e.target)) return;
            const k = e.key.toLowerCase();

            if (k === 'arrowleft' || k === 'a') {
                keysRef.current.left = true;
            }
            if (k === 'arrowright' || k === 'd') {
                keysRef.current.right = true;
            }
            if (k === 'arrowup' || k === 'w') {
                keysRef.current.up = true;
                if (!e.repeat) jumpQueuedRef.current = true;
            }
            if (k === 'arrowdown' || k === 's') {
                keysRef.current.down = true;
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
            if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
            if (k === 'arrowdown' || k === 's') keysRef.current.down = false;
            if (k === 'arrowup' || k === 'w') keysRef.current.up = false;
        };

        const onBlur = () => {
            keysRef.current.left = false;
            keysRef.current.right = false;
            keysRef.current.up = false;
            keysRef.current.down = false;
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    useEffect(() => {
        const tick = (t: number) => {
            const dt = lastTickRef.current
                ? Math.min(50, t - lastTickRef.current)
                : 16;
            lastTickRef.current = t;
            const viewportW = window.innerWidth;
            const maxX = Math.max(0, viewportW - playerW - 8);

            const movingLeft = keysRef.current.left && !keysRef.current.right;
            const movingRight = keysRef.current.right && !keysRef.current.left;
            const requestedDir: 0 | -1 | 1 = movingLeft
                ? -1
                : movingRight
                  ? 1
                  : 0;
            const downPressed = keysRef.current.down;
            const upPressed = keysRef.current.up;

            if (requestedDir !== 0 && moveDirRef.current !== requestedDir) {
                moveDirRef.current = requestedDir;
                moveHoldMsRef.current = 0;
            }
            if (requestedDir === 0) {
                moveDirRef.current = 0;
                moveHoldMsRef.current = 0;
            }

            const inAirEarly = yRef.current > 0;
            const duckingOnGround = downPressed && !inAirEarly;
            const flyCombo = upPressed && requestedDir !== 0;
            const blownByScroll =
                requestedDir === 0 &&
                !downPressed &&
                !upPressed &&
                !inAirEarly &&
                t < scrollBurstUntilRef.current;
            if (
                requestedDir !== 0 &&
                !inAirEarly &&
                !duckingOnGround &&
                !flyCombo
            ) {
                moveHoldMsRef.current += dt;
            } else if (requestedDir === 0) {
                moveHoldMsRef.current = 0;
            }
            const holdMs = moveHoldMsRef.current;
            const isRunning =
                !inAirEarly &&
                !duckingOnGround &&
                !flyCombo &&
                requestedDir !== 0 &&
                holdMs >= RUN_TRIGGER_MS;
            const moveSpeed = isRunning ? RUN_SPEED : WALK_SPEED;
            const vx = flyCombo
                ? requestedDir * FLY_SPEED_X
                : duckingOnGround
                  ? 0
                  : requestedDir * moveSpeed;

            if (vx < 0) facingRef.current = -1;
            if (vx > 0) facingRef.current = 1;
            if (blownByScroll) {
                facingRef.current = scrollDirRef.current;
            }

            let nextX = xRef.current + vx;
            nextX = Math.max(8, Math.min(maxX, nextX));
            xRef.current = nextX;

            if (flyCombo) {
                const maxY = Math.max(
                    0,
                    window.innerHeight - playerH - FLOOR_OFFSET - 8,
                );
                yRef.current = Math.max(
                    0,
                    Math.min(maxY, yRef.current + FLY_SPEED_Y),
                );
                vyRef.current = 0;
                jumpQueuedRef.current = false;
            }

            const onGround = yRef.current <= 0;
            if (!flyCombo && jumpQueuedRef.current && onGround) {
                vyRef.current = JUMP_VELOCITY;
            }
            jumpQueuedRef.current = false;

            if (!flyCombo && (!onGround || vyRef.current > 0)) {
                let nextY = yRef.current + vyRef.current;
                let nextVy = vyRef.current - GRAVITY;

                if (nextY <= 0) {
                    nextY = 0;
                    nextVy = 0;
                }
                yRef.current = nextY;
                vyRef.current = nextVy;
            }

            const inAir = yRef.current > 0;
            const fallingFromSky = inAir && vyRef.current < -0.35;
            const nextMode:
                | 'idle'
                | 'walk'
                | 'run'
                | 'air'
                | 'duck'
                | 'blown'
                | 'fly'
                | 'fall' = flyCombo
                ? 'fly'
                : fallingFromSky
                  ? 'fall'
                  : inAir
                    ? 'air'
                    : duckingOnGround
                      ? 'duck'
                      : blownByScroll
                        ? 'blown'
                        : requestedDir === 0
                          ? 'idle'
                          : isRunning
                            ? 'run'
                            : 'walk';
            if (modeRef.current !== nextMode) {
                modeRef.current = nextMode;
                frameRef.current = 0;
                lastFrameAtRef.current = t;
            }

            if (
                modeRef.current === 'walk' ||
                modeRef.current === 'run' ||
                modeRef.current === 'idle' ||
                modeRef.current === 'air' ||
                modeRef.current === 'duck' ||
                modeRef.current === 'blown' ||
                modeRef.current === 'fly' ||
                modeRef.current === 'fall'
            ) {
                const step =
                    modeRef.current === 'run'
                        ? RUN_FRAME_STEP_MS
                        : modeRef.current === 'walk'
                          ? WALK_FRAME_STEP_MS
                          : modeRef.current === 'air'
                            ? JUMP_FRAME_STEP_MS
                            : modeRef.current === 'duck'
                              ? DUCK_FRAME_STEP_MS
                              : modeRef.current === 'blown'
                                ? BLOWN_FRAME_STEP_MS
                                : modeRef.current === 'fly'
                                  ? FLY_FRAME_STEP_MS
                                  : modeRef.current === 'fall'
                                    ? FALL_FRAME_STEP_MS
                                    : IDLE_FRAME_STEP_MS;
                if (!lastFrameAtRef.current) lastFrameAtRef.current = t;
                if (t - lastFrameAtRef.current >= step) {
                    const activeFrameCount =
                        modeRef.current === 'idle'
                            ? IDLE_SPRITE_FRAMES
                            : modeRef.current === 'blown'
                              ? BLOWN_SPRITE_FRAMES
                              : modeRef.current === 'fall'
                                ? FALL_SPRITE_FRAMES
                                : SPRITE_FRAMES;
                    lastFrameAtRef.current = t;
                    frameRef.current =
                        (frameRef.current + 1) % activeFrameCount;
                }
            }

            setX(xRef.current);
            setY(yRef.current);
            setFacing(facingRef.current);
            setFrame(frameRef.current);
            setMode(modeRef.current);

            window.dispatchEvent(
                new CustomEvent('sprite:state', {
                    detail: {
                        x: xRef.current,
                        y: yRef.current,
                        facing: facingRef.current,
                        moving: vx !== 0,
                        running: modeRef.current === 'run',
                        jumping: inAir,
                        ducking: modeRef.current === 'duck',
                        blown: modeRef.current === 'blown',
                        flying: modeRef.current === 'fly',
                        falling: modeRef.current === 'fall',
                        frame: frameRef.current,
                        mode: modeRef.current,
                        at: t,
                    },
                }),
            );

            rafRef.current = window.requestAnimationFrame(tick);
        };

        rafRef.current = window.requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
            lastTickRef.current = 0;
        };
    }, [playerW]);

    useEffect(() => {
        const spriteKey: SpriteKey =
            mode === 'idle'
                ? 'idle'
                : mode === 'air'
                  ? 'jump'
                  : mode === 'run'
                    ? 'run'
                    : mode === 'duck'
                      ? 'duck'
                      : mode === 'fall'
                        ? 'fall'
                        : mode === 'blown'
                          ? 'blown'
                          : mode === 'fly'
                            ? 'fly'
                            : 'walk';
        const meta = spritesRef.current[spriteKey];
        if (!meta.img) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const renderW =
            spriteKey === 'blown'
                ? Math.max(playerW, Math.round(playerW * BLOWN_RENDER_WIDTH_MULT))
                : playerW;
        const renderH = playerH;
        canvas.width = renderW;
        canvas.height = renderH;

        ctx.clearRect(0, 0, renderW, renderH);
        ctx.imageSmoothingEnabled = false;

        const spriteFrameCount =
            spriteKey === 'idle'
                ? IDLE_SPRITE_FRAMES
                : spriteKey === 'blown'
                  ? BLOWN_SPRITE_FRAMES
                  : spriteKey === 'fall'
                    ? FALL_SPRITE_FRAMES
                    : SPRITE_FRAMES;
        const frameIndex = Math.max(0, Math.min(spriteFrameCount - 1, frame));
        const srcW = meta.img.naturalWidth;
        const srcH = meta.img.naturalHeight;
        const specialBound =
            spriteKey === 'fly' || spriteKey === 'run'
                ? meta.frameBounds?.[frameIndex]
                : undefined;
        let sx = 0;
        let sy = 0;
        let sw = 1;
        let sh = Math.floor(meta.frameH);
        let dx = 0;
        let dy = 0;
        let dw = renderW;
        let dh = renderH;

        if (spriteKey === 'fly' || spriteKey === 'run') {
            const cellStart = Math.round((frameIndex * srcW) / SPRITE_FRAMES);
            const cellEnd = Math.round(
                ((frameIndex + 1) * srcW) / SPRITE_FRAMES,
            );
            const cellW = Math.max(1, cellEnd - cellStart);
            const frameH = Math.max(1, meta.frameH);

            if (specialBound) {
                sx = specialBound.sx;
                sy = specialBound.sy;
                sw = specialBound.sw;
                sh = specialBound.sh;

                dw = Math.max(1, Math.round((sw * playerW) / cellW));
                dh = Math.max(1, Math.round((sh * playerH) / frameH));
                if (spriteKey === 'run') {
                    // Center horizontally so per-frame x-offset variation doesn't
                    // cause visible jitter that looks like bleeding.
                    dx = Math.round((playerW - dw) / 2);
                    dy = Math.round((playerH - dh) / 2);
                } else {
                    // Position-preserving for fly: maps bounds to their
                    // exact relative position within the canvas.
                    dx = Math.round(((sx - cellStart) * playerW) / cellW);
                    dy = Math.round((sy * playerH) / frameH);
                }
            } else {
                const maxInset = Math.max(0, Math.floor((cellW - 1) / 2));
                const inset = Math.min(FLY_SAFE_INSET_PX, maxInset);
                sx = cellStart + inset;
                sy = 0;
                sw = Math.max(1, cellW - inset * 2);
                sh = frameH;
            }
        } else if (spriteKey === 'blown') {
            const cols = BLOWN_SPRITE_COLS;
            const rows = BLOWN_SPRITE_ROWS;
            const clampedIndex = Math.max(
                0,
                Math.min(cols * rows - 1, frameIndex),
            );
            const col = clampedIndex % cols;
            const row = Math.floor(clampedIndex / cols);
            const cellW = Math.max(1, Math.floor(srcW / cols));
            const cellH = Math.max(1, Math.floor(srcH / rows));
            const cellSx = col * cellW;
            const cellSy = row * cellH;
            const bound = meta.frameBounds?.[clampedIndex];
            const heights = (meta.frameBounds ?? []).map((b) => b.sh).sort((a, b) => a - b);
            const mid = Math.floor(heights.length / 2);
            const refH = Math.max(1, Math.min(cellH, heights.length > 0 ? heights[mid] : cellH));
            if (bound) {
                const desiredSx = bound.sx - BLOWN_BOUND_PAD_X;
                const desiredSy = bound.sy - BLOWN_BOUND_PAD_Y;
                const desiredEx = bound.sx + bound.sw + BLOWN_BOUND_PAD_X;
                const desiredEy = bound.sy + bound.sh + BLOWN_BOUND_PAD_Y;
                sx = Math.max(cellSx, desiredSx);
                sy = Math.max(cellSy, desiredSy);
                const ex = Math.min(cellSx + cellW, desiredEx);
                const ey = Math.min(cellSy + cellH, desiredEy);
                sw = Math.max(1, ex - sx);
                sh = Math.max(1, ey - sy);
            } else {
                sx = cellSx;
                sy = cellSy;
                sw = cellW;
                sh = cellH;
            }

            // Match blown visual body size to idle:
            // use stable reference height, and allow blown's wider render box.
            const targetHeight = playerH * 0.98;
            const maxWidth = renderW * 0.98;
            const scale = Math.min(targetHeight / refH, maxWidth / sw);
            dw = Math.max(1, Math.round(sw * scale));
            dh = Math.max(1, Math.round(sh * scale));
            dx = Math.round((renderW - dw) / 2);
            dy = Math.round(renderH - dh);
        } else if (spriteKey === 'fall') {
            const cols = FALL_SPRITE_COLS;
            const rows = FALL_SPRITE_ROWS;
            const clampedIndex = Math.max(
                0,
                Math.min(cols * rows - 1, frameIndex),
            );
            const col = clampedIndex % cols;
            const row = Math.floor(clampedIndex / cols);
            const cellW = Math.max(1, Math.floor(srcW / cols));
            const cellH = Math.max(1, Math.floor(srcH / rows));
            const cellSx = col * cellW;
            const cellSy = row * cellH;
            const bound = meta.frameBounds?.[clampedIndex];
            sx = bound?.sx ?? cellSx;
            sy = bound?.sy ?? cellSy;
            sw = Math.max(1, Math.min(bound?.sw ?? cellW, srcW - sx));
            sh = Math.max(1, Math.min(bound?.sh ?? cellH, srcH - sy));

            // Fall sprite: near full height, but constrained to canvas width.
            const targetHeight = playerH * 0.98;
            const maxWidth = playerW * 0.98;
            const scale = Math.min(targetHeight / sh, maxWidth / sw);
            dw = Math.max(1, Math.round(sw * scale));
            dh = Math.max(1, Math.round(sh * scale));
            dx = Math.round((playerW - dw) / 2);
            dy = Math.round(playerH - dh);
        } else if (spriteKey === 'idle') {
            const cols = IDLE_SPRITE_COLS;
            const rows = IDLE_SPRITE_ROWS;
            const clampedIndex = Math.max(
                0,
                Math.min(IDLE_SPRITE_FRAMES - 1, frameIndex),
            );
            const col = clampedIndex % cols;
            const row = Math.floor(clampedIndex / cols);
            const cellW = Math.max(1, Math.floor(srcW / cols));
            const cellH = Math.max(1, Math.floor(srcH / rows));
            const cellSx = col * cellW;
            const cellSy = row * cellH;
            sx = cellSx;
            sy = cellSy;
            sw = Math.max(1, Math.min(cellW, srcW - sx));
            sh = Math.max(1, Math.min(cellH, srcH - sy));

            const targetHeight = playerH * 1.15;
            const maxWidth = playerW * 1.15;
            const scale = Math.min(targetHeight / sh, maxWidth / sw);
            dw = Math.max(1, Math.round(sw * scale));
            dh = Math.max(1, Math.round(sh * scale));
            dx = Math.round((playerW - dw) / 2);
            dy = Math.round(playerH - dh);
        } else {
            const sxStart = Math.round((frameIndex * srcW) / SPRITE_FRAMES);
            const sxEnd = Math.round(((frameIndex + 1) * srcW) / SPRITE_FRAMES);
            const baseSx = Math.max(0, Math.min(srcW - 1, sxStart));
            const baseSw = Math.max(1, Math.min(srcW - baseSx, sxEnd - baseSx));
            const maxInset = Math.max(0, Math.floor((baseSw - 1) / 2));
            const jumpLeft = Math.min(JUMP_FRAME_INSET_LEFT_PX, maxInset);
            const jumpRight = Math.min(JUMP_FRAME_INSET_RIGHT_PX, maxInset);
            const insetLeft = spriteKey === 'jump' ? jumpLeft : 0;
            const insetRight = spriteKey === 'jump' ? jumpRight : 0;
            const safeInsetLeft = Math.min(insetLeft, Math.max(0, baseSw - 1));
            const safeInsetRight = Math.min(
                insetRight,
                Math.max(0, baseSw - safeInsetLeft - 1),
            );
            sx = baseSx + safeInsetLeft;
            sw = Math.max(1, baseSw - safeInsetLeft - safeInsetRight);
            sy = 0;
            sh = Math.floor(meta.frameH);
        }

        ctx.drawImage(meta.img, sx, sy, sw, sh, dx, dy, dw, dh);
        const imageData = ctx.getImageData(0, 0, renderW, renderH);
        const px = imageData.data;
        for (let i = 0; i < px.length; i += 4) {
            const a = px[i + 3];
            if (a === 0) continue;
            const luma = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
            const tone =
                luma < 45 ? 0 : luma < 95 ? 48 : luma < 170 ? 140 : 255;
            px[i] = tone;
            px[i + 1] = tone;
            px[i + 2] = tone;
        }
        ctx.putImageData(imageData, 0, 0);
    }, [frame, mode, playerW, playerH]);

    return (
        <div
            className="pointer-events-none fixed inset-0 z-[30]"
            aria-hidden="true"
        >
            <div
                id="sprite-anchor"
                className="absolute will-change-transform"
                style={{
                    left: `${x}px`,
                    bottom: `${FLOOR_OFFSET + y}px`,
                    width: `${mode === 'blown' ? Math.max(playerW, Math.round(playerW * BLOWN_RENDER_WIDTH_MULT)) : playerW}px`,
                    height: `${playerH}px`,
                    transform: facing === -1 ? 'scaleX(-1)' : 'scaleX(1)',
                    transformOrigin: 'center center',
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={mode === 'blown' ? Math.max(playerW, Math.round(playerW * BLOWN_RENDER_WIDTH_MULT)) : playerW}
                    height={playerH}
                    className="block h-full w-full"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
        </div>
    );
};

export default SpriteWalker;
