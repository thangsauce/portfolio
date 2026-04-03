'use client';

import { useEffect, useState } from 'react';
import SpriteWalker from '@/components/SpriteWalker';

const SpriteGate = () => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const isDone =
            document.documentElement.getAttribute('data-preloader-done') ===
            'true';
        if (isDone) {
            setReady(true);
            return;
        }

        const handleDone = () => setReady(true);
        window.addEventListener('preloader:done', handleDone);
        return () => window.removeEventListener('preloader:done', handleDone);
    }, []);

    if (!ready) return null;
    return <SpriteWalker />;
};

export default SpriteGate;

