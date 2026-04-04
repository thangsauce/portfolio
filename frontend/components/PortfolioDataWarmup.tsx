'use client';

import { useEffect } from 'react';
import { preloadPortfolioData } from '@/lib/portfolioPrefetch';

export default function PortfolioDataWarmup() {
    useEffect(() => {
        preloadPortfolioData();
    }, []);
    return null;
}

