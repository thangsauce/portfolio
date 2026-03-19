'use client';
import React, { useEffect, useRef } from 'react';

const ScrollProgressIndicator = () => {
    const scrollBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollBarRef.current) {
                const { scrollHeight, clientHeight } = document.documentElement;
                const scrollableHeight = scrollHeight - clientHeight;
                const scrollY = window.scrollY;
                const scrollProgress = (scrollY / scrollableHeight) * 100;

                scrollBarRef.current.style.transform = `scaleX(${scrollProgress / 100})`;
            }
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="hidden md:block fixed top-0 left-0 right-0 h-[3px] z-[5] bg-background-light">
            <div
                className="h-full bg-primary origin-left scale-x-0"
                ref={scrollBarRef}
            ></div>
        </div>
    );
};

export default ScrollProgressIndicator;
