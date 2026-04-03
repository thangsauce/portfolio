'use client';

import { useEffect, useRef, useState } from 'react';

const SPRITE_ASSET_VERSION = '2026-04-03-01';
const WALK_SPRITE_SRC = `/sprites/sprite-walking.png?v=${SPRITE_ASSET_VERSION}`;
const RUN_SPRITE_SRC = `/sprites/sprite-running.png?v=${SPRITE_ASSET_VERSION}`;
const IDLE_SPRITE_SRC = `/sprites/sprite-idling.png?v=${SPRITE_ASSET_VERSION}`;
const JUMP_SPRITE_SRC = `/sprites/sprite-jumping.png?v=${SPRITE_ASSET_VERSION}`;
const DUCK_SPRITE_SRC = `/sprites/sprite-ducking.png?v=${SPRITE_ASSET_VERSION}`;
const BLOWN_SPRITE_SRC = `/sprites/sprite-blown-away.png?v=${SPRITE_ASSET_VERSION}`;
const FLY_SPRITE_SRC = `/sprites/sprite-flying.png?v=${SPRITE_ASSET_VERSION}`;
const FALL_SPRITE_SRC = `/sprites/sprite-falling-down.png?v=${SPRITE_ASSET_VERSION}`;
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
const ALPHA_THRESHOLD = 10;
const FALL_SPRITE_COLS = 2;
const FALL_SPRITE_ROWS = 3;
const JUMP_SPRITE_COLS = 3;
const JUMP_SPRITE_ROWS = 3;
const DUCK_SPRITE_COLS = 3;
const DUCK_SPRITE_ROWS = 3;
const FLY_SPRITE_COLS = 3;
const FLY_SPRITE_ROWS = 3;
const FLY_SIZE_MULT = 0.88;
const WALK_SPRITE_COLS = 3;
const WALK_SPRITE_ROWS = 3;
const WALK_BOUND_PAD_X = 8;
const WALK_BOUND_PAD_Y = 14;
const RUN_SPRITE_COLS = 3;
const RUN_SPRITE_ROWS = 3;
const BLOWN_SPRITE_COLS = 2;
const BLOWN_SPRITE_ROWS = 3;
const BLOWN_RENDER_WIDTH_MULT = 1.9;
const BLOWN_BOUND_PAD_X = 28;
const BLOWN_BOUND_PAD_Y = 10;
const SPRITE_HEAD_SAFE_PAD_X = 8;
const SPRITE_HEAD_SAFE_PAD_Y = 14;
const IDLE_SPRITE_COLS = 4;
const IDLE_SPRITE_ROWS = 2;
const IDLE_SPRITE_FRAMES = IDLE_SPRITE_COLS * IDLE_SPRITE_ROWS;
const BLOWN_SPRITE_FRAMES = BLOWN_SPRITE_COLS * BLOWN_SPRITE_ROWS;
const FALL_SPRITE_FRAMES = FALL_SPRITE_COLS * FALL_SPRITE_ROWS;
const JUMP_SPRITE_FRAMES = JUMP_SPRITE_COLS * JUMP_SPRITE_ROWS;
const DUCK_SPRITE_FRAMES = DUCK_SPRITE_COLS * DUCK_SPRITE_ROWS;
const FLY_SPRITE_FRAMES = FLY_SPRITE_COLS * FLY_SPRITE_ROWS;
const WALK_SPRITE_FRAMES = WALK_SPRITE_COLS * WALK_SPRITE_ROWS;
const RUN_SPRITE_FRAMES = RUN_SPRITE_COLS * RUN_SPRITE_ROWS;

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

function computeGridFrameAlphaBounds(
    img: HTMLImageElement,
    cols: number,
    rows: number,
    padX = 1,
    padY = 1,
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

        const sx = Math.max(cellStartX, minX - padX);
        const ex = Math.min(cellEndX - 1, maxX + padX);
        const sy = Math.max(cellStartY, minY - padY);
        const ey = Math.min(cellEndY - 1, maxY + padY);
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
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [frameW, setFrameW] = useState(DEFAULT_FRAME_W);
    const [frameH, setFrameH] = useState(DEFAULT_FRAME_H);

    const playerW = Math.max(1, Math.round(frameW * SPRITE_SCALE));
    const playerH = Math.max(1, Math.round(frameH * SPRITE_SCALE));

    useEffect(() => {
        const syncTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDarkTheme(theme !== 'light');
        };
        syncTheme();
        const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

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
                            : key === 'fly'
                              ? img.naturalWidth / FLY_SPRITE_COLS
                            : key === 'jump'
                              ? img.naturalWidth / JUMP_SPRITE_COLS
                            : key === 'duck'
                              ? img.naturalWidth / DUCK_SPRITE_COLS
                            : key === 'walk'
                              ? img.naturalWidth / WALK_SPRITE_COLS
                            : key === 'run'
                              ? img.naturalWidth / RUN_SPRITE_COLS
                            : key === 'blown'
                              ? img.naturalWidth / BLOWN_SPRITE_COLS
                              : key === 'idle'
                                ? img.naturalWidth / IDLE_SPRITE_COLS
                                : img.naturalWidth / SPRITE_FRAMES,
                    frameH:
                        key === 'fall'
                            ? img.naturalHeight / FALL_SPRITE_ROWS
                            : key === 'fly'
                              ? img.naturalHeight / FLY_SPRITE_ROWS
                            : key === 'jump'
                              ? img.naturalHeight / JUMP_SPRITE_ROWS
                            : key === 'duck'
                              ? img.naturalHeight / DUCK_SPRITE_ROWS
                            : key === 'walk'
                              ? img.naturalHeight / WALK_SPRITE_ROWS
                            : key === 'run'
                              ? img.naturalHeight / RUN_SPRITE_ROWS
                            : key === 'blown'
                              ? img.naturalHeight / BLOWN_SPRITE_ROWS
                              : key === 'idle'
                                ? img.naturalHeight / IDLE_SPRITE_ROWS
                                : img.naturalHeight,
                    frameBounds:
                        key === 'fly'
                            ? undefined
                            : key === 'walk'
                              ? computeGridFrameAlphaBounds(
                                    img,
                                    WALK_SPRITE_COLS,
                                    WALK_SPRITE_ROWS,
                                    WALK_BOUND_PAD_X,
                                    WALK_BOUND_PAD_Y,
                                )
                            : key === 'fall'
                              ? computeGridFrameAlphaBounds(
                                    img,
                                    FALL_SPRITE_COLS,
                                    FALL_SPRITE_ROWS,
                                    SPRITE_HEAD_SAFE_PAD_X,
                                    SPRITE_HEAD_SAFE_PAD_Y,
                                )
                            : key === 'jump'
                              ? computeGridFrameAlphaBounds(
                                    img,
                                    JUMP_SPRITE_COLS,
                                    JUMP_SPRITE_ROWS,
                                    SPRITE_HEAD_SAFE_PAD_X,
                                    SPRITE_HEAD_SAFE_PAD_Y,
                                )
                            : key === 'duck'
                              ? computeGridFrameAlphaBounds(
                                    img,
                                    DUCK_SPRITE_COLS,
                                    DUCK_SPRITE_ROWS,
                                    SPRITE_HEAD_SAFE_PAD_X,
                                    SPRITE_HEAD_SAFE_PAD_Y,
                                )
                              : key === 'blown'
                                ? computeGridFrameAlphaBounds(
                                      img,
                                      BLOWN_SPRITE_COLS,
                                      BLOWN_SPRITE_ROWS,
                                      SPRITE_HEAD_SAFE_PAD_X,
                                      SPRITE_HEAD_SAFE_PAD_Y,
                                  )
                                : key === 'run'
                                  ? computeGridFrameAlphaBounds(
                                        img,
                                        RUN_SPRITE_COLS,
                                        RUN_SPRITE_ROWS,
                                        SPRITE_HEAD_SAFE_PAD_X,
                                        SPRITE_HEAD_SAFE_PAD_Y,
                                    )
                                  : undefined,
                };

                // Use walk sprite as canonical display proportion.
                if (key === 'walk') {
                    setFrameW(img.naturalWidth / WALK_SPRITE_COLS);
                    setFrameH(img.naturalHeight / WALK_SPRITE_ROWS);
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
                            : modeRef.current === 'walk'
                              ? WALK_SPRITE_FRAMES
                            : modeRef.current === 'air'
                              ? JUMP_SPRITE_FRAMES
                            : modeRef.current === 'duck'
                              ? DUCK_SPRITE_FRAMES
                            : modeRef.current === 'fly'
                              ? FLY_SPRITE_FRAMES
                            : modeRef.current === 'run'
                              ? RUN_SPRITE_FRAMES
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
                : spriteKey === 'walk'
                  ? WALK_SPRITE_FRAMES
                : spriteKey === 'jump'
                  ? JUMP_SPRITE_FRAMES
                : spriteKey === 'duck'
                  ? DUCK_SPRITE_FRAMES
                : spriteKey === 'fly'
                  ? FLY_SPRITE_FRAMES
                : spriteKey === 'run'
                  ? RUN_SPRITE_FRAMES
                : spriteKey === 'blown'
                  ? BLOWN_SPRITE_FRAMES
                  : spriteKey === 'fall'
                    ? FALL_SPRITE_FRAMES
                    : SPRITE_FRAMES;
        const frameIndex = Math.max(0, Math.min(spriteFrameCount - 1, frame));
        const srcW = meta.img.naturalWidth;
        const srcH = meta.img.naturalHeight;
        let sx = 0;
        let sy = 0;
        let sw = 1;
        let sh = Math.floor(meta.frameH);
        let dx = 0;
        let dy = 0;
        let dw = renderW;
        let dh = renderH;

        if (spriteKey === 'fly') {
            const cols = FLY_SPRITE_COLS;
            const rows = FLY_SPRITE_ROWS;
            const clampedIndex = Math.max(
                0,
                Math.min(cols * rows - 1, frameIndex),
            );
            const col = clampedIndex % cols;
            const row = Math.floor(clampedIndex / cols);
            const cellW = Math.max(1, Math.floor(srcW / cols));
            const cellH = Math.max(1, Math.floor(srcH / rows));
            const insetX = Math.max(0, Math.floor(cellW * 0.03));
            const insetY = Math.max(0, Math.floor(cellH * 0.03));
            sx = col * cellW + insetX;
            sy = row * cellH + insetY;
            sw = Math.max(1, Math.min(cellW - insetX * 2, srcW - sx));
            sh = Math.max(1, Math.min(cellH - insetY * 2, srcH - sy));

            const targetHeight = playerH * 0.98 * FLY_SIZE_MULT;
            const maxWidth = playerW * 0.98;
            const scale = Math.min(targetHeight / sh, maxWidth / sw);
            dw = Math.max(1, Math.round(sw * scale));
            dh = Math.max(1, Math.round(sh * scale));
            dx = Math.round((playerW - dw) / 2);
            dy = Math.round(playerH - dh);
        } else if (spriteKey === 'walk') {
            const cols = WALK_SPRITE_COLS;
            const rows = WALK_SPRITE_ROWS;
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

            const widths = (meta.frameBounds ?? []).map((b) => b.sw);
            const heights = (meta.frameBounds ?? []).map((b) => b.sh);
            const refW = widths.length ? Math.max(...widths) : sw;
            const refH = heights.length ? Math.max(...heights) : sh;

            const targetHeight = playerH * 0.9;
            const maxWidth = playerW * 0.9;
            const scale = Math.min(targetHeight / refH, maxWidth / refW);
            dw = Math.max(1, Math.round(refW * scale));
            dh = Math.max(1, Math.round(refH * scale));
            dx = Math.round((playerW - dw) / 2);
            dy = Math.round(playerH - dh);
        } else if (spriteKey === 'run') {
            const cols = RUN_SPRITE_COLS;
            const rows = RUN_SPRITE_ROWS;
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
            const widths = (meta.frameBounds ?? []).map((b) => b.sw).sort((a, b) => a - b);
            const heights = (meta.frameBounds ?? []).map((b) => b.sh).sort((a, b) => a - b);
            const mid = Math.floor(widths.length / 2);
            const refW = Math.max(1, Math.min(cellW, widths.length > 0 ? widths[mid] : cellW));
            const refH = Math.max(1, Math.min(cellH, heights.length > 0 ? heights[mid] : cellH));
            const centerX = bound ? bound.sx + bound.sw / 2 : cellSx + cellW / 2;
            const centerY = bound ? bound.sy + bound.sh / 2 : cellSy + cellH / 2;
            const desiredSx = Math.round(centerX - refW / 2);
            const desiredSy = Math.round(centerY - refH / 2);
            sx = Math.max(cellSx, Math.min(cellSx + cellW - refW, desiredSx));
            sy = Math.max(cellSy, Math.min(cellSy + cellH - refH, desiredSy));
            sw = refW;
            sh = refH;

            const targetHeight = playerH * 0.98;
            const maxWidth = playerW * 0.98;
            const scale = Math.min(targetHeight / refH, maxWidth / refW);
            // Keep run output size/baseline stable across frames to avoid bobbing.
            dw = Math.max(1, Math.round(refW * scale));
            dh = Math.max(1, Math.round(refH * scale));
            dx = Math.round((playerW - dw) / 2);
            dy = Math.round(playerH - dh);
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
            const maxWidth = playerW * 0.98;
            const scale = Math.min(targetHeight / refH, maxWidth / sw);
            dw = Math.max(1, Math.round(sw * scale));
            dh = Math.max(1, Math.round(sh * scale));
            if (dh > renderH || dw > renderW) {
                const fitScale = Math.min(renderH / dh, renderW / dw);
                dw = Math.max(1, Math.round(dw * fitScale));
                dh = Math.max(1, Math.round(dh * fitScale));
            }
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
        } else if (spriteKey === 'jump') {
            const cols = JUMP_SPRITE_COLS;
            const rows = JUMP_SPRITE_ROWS;
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

            const heights = (meta.frameBounds ?? []).map((b) => b.sh);
            const refH = heights.length ? Math.max(...heights) : sh;
            const targetHeight = playerH * 0.98;
            const maxWidth = playerW * 0.98;
            const scale = Math.min(targetHeight / refH, maxWidth / sw);
            dw = Math.max(1, Math.round(sw * scale));
            dh = Math.max(1, Math.round(sh * scale));
            dx = Math.round((playerW - dw) / 2);
            dy = Math.round(playerH - dh);
        } else if (spriteKey === 'duck') {
            const cols = DUCK_SPRITE_COLS;
            const rows = DUCK_SPRITE_ROWS;
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

            const heights = (meta.frameBounds ?? []).map((b) => b.sh);
            const refH = heights.length ? Math.max(...heights) : sh;
            const targetHeight = playerH * 0.98;
            const maxWidth = playerW * 0.98;
            const scale = Math.min(targetHeight / refH, maxWidth / sw);
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

            const targetHeight = playerH * 0.98;
            const maxWidth = playerW * 0.98;
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
            sx = baseSx;
            sw = baseSw;
            sy = 0;
            sh = Math.floor(meta.frameH);
        }

        ctx.drawImage(meta.img, sx, sy, sw, sh, dx, dy, dw, dh);
        const imageData = ctx.getImageData(0, 0, renderW, renderH);
        const px = imageData.data;
        const darkModeRamp = [26, 88, 156, 232] as const;
        const lightModeRamp = [0, 48, 140, 255] as const;
        const ramp = isDarkTheme ? darkModeRamp : lightModeRamp;
        for (let i = 0; i < px.length; i += 4) {
            const a = px[i + 3];
            if (a === 0) continue;
            const luma = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
            const tone =
                luma < 45
                    ? ramp[0]
                    : luma < 95
                      ? ramp[1]
                      : luma < 170
                        ? ramp[2]
                        : ramp[3];
            px[i] = tone;
            px[i + 1] = tone;
            px[i + 2] = tone;
        }
        ctx.putImageData(imageData, 0, 0);
    }, [frame, mode, playerW, playerH, isDarkTheme]);

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
                    style={{
                        imageRendering: 'pixelated',
                        filter: isDarkTheme
                            ? 'drop-shadow(0 0 1px rgba(255,255,255,0.18))'
                            : 'none',
                    }}
                />
            </div>
        </div>
    );
};

export default SpriteWalker;
