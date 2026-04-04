import { apiFetch } from '@/lib/api';

type CurrentlyUsingItem = { id: string; name: string; icon_url?: string | null };
type StackItem = { id: string; name: string; category: string; icon_url: string | null };

let currentlyUsingCache: CurrentlyUsingItem[] | null = null;
let currentlyUsingPromise: Promise<CurrentlyUsingItem[]> | null = null;

let stacksCache: StackItem[] | null = null;
let stacksPromise: Promise<StackItem[]> | null = null;

async function loadCurrentlyUsing(): Promise<CurrentlyUsingItem[]> {
    const endpoints = [
        '/api/portfolio/currently_using',
        '/api/portfolio/currently-using',
        '/api/portfolio/skills',
    ];
    for (const endpoint of endpoints) {
        try {
            const data = await apiFetch<CurrentlyUsingItem[]>(endpoint);
            if (Array.isArray(data)) return data;
        } catch {
            // fallback to next endpoint
        }
    }
    return [];
}

export async function getCurrentlyUsing(): Promise<CurrentlyUsingItem[]> {
    if (currentlyUsingCache) return currentlyUsingCache;
    if (!currentlyUsingPromise) {
        currentlyUsingPromise = loadCurrentlyUsing()
            .then((data) => {
                currentlyUsingCache = data;
                return data;
            })
            .finally(() => {
                currentlyUsingPromise = null;
            });
    }
    return currentlyUsingPromise;
}

export async function getStacks(): Promise<StackItem[]> {
    if (stacksCache) return stacksCache;
    if (!stacksPromise) {
        stacksPromise = apiFetch<StackItem[]>('/api/portfolio/stacks')
            .then((data) => {
                stacksCache = Array.isArray(data) ? data : [];
                return stacksCache;
            })
            .catch(() => [])
            .finally(() => {
                stacksPromise = null;
            });
    }
    return stacksPromise;
}

export function preloadPortfolioData(): void {
    void getCurrentlyUsing();
    void getStacks();
}

