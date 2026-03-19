'use client';
import { useEffect, useState } from 'react';

import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const initial = saved || 'dark';
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="fixed bottom-6 right-5 md:right-10 z-[50] w-10 h-10 rounded-full border border-border bg-background-light flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-primary shadow-lg group overflow-hidden"
        >
            <div className="relative w-5 h-5">
                <Sun 
                    className={`absolute inset-0 transition-all duration-500 transform ${
                        theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 opacity-0'
                    } text-primary`} 
                />
                <Moon 
                    className={`absolute inset-0 transition-all duration-500 transform ${
                        theme === 'light' ? 'rotate-0 scale-100' : '-rotate-90 scale-0 opacity-0'
                    } text-primary`} 
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
