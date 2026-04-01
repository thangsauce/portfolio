'use client';
import ArrowAnimation from '@/components/ArrowAnimation';
import Button from '@/components/Button';
import { apiFetch } from '@/lib/api';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useLenis } from 'lenis/react';
import Image from 'next/image';
import React from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Banner = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const [resumeUrl, setResumeUrl] = React.useState('/resume.pdf');

    React.useEffect(() => {
        let mounted = true;
        apiFetch<{ url: string }>('/api/portfolio/resume')
            .then((r) => {
                if (mounted && r?.url) setResumeUrl(r.url);
            })
            .catch(() => {
                // Keep /resume.pdf fallback if API is unavailable.
            });
        return () => {
            mounted = false;
        };
    }, []);

    // move the content a little up on scroll
    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'bottom 70%',
                    end: 'bottom 10%',
                    scrub: 1,
                },
            });

            tl.fromTo(
                '.slide-up-and-fade',
                { y: 0 },
                { y: -150, opacity: 0, stagger: 0.02 },
            );
        },
        { scope: containerRef },
    );

    return (
        <section className="relative overflow-hidden" id="banner">
            <ArrowAnimation />
            <div
                className="container h-[100svh] min-h-[530px] pb-10 flex flex-col justify-center relative"
                ref={containerRef}
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-10 lg:gap-12">
                    <div className="flex flex-col items-start max-w-[620px]">
                        <div className="relative">
                            <h1 className="banner-title slide-up-and-fade leading-[.95] text-6xl sm:text-[80px] font-anton">
                                <span className="text-primary">IT</span>
                                <br /> <span className="ml-4">SPECIALIST</span>
                            </h1>
                            <p className="slide-up-and-fade absolute right-0 top-[32%] sm:top-[34%] text-sm sm:text-base uppercase tracking-widest text-muted-foreground/70 whitespace-nowrap">
                                Orlando, FL
                            </p>
                        </div>
                        <p className="banner-description slide-up-and-fade mt-6 text-lg text-muted-foreground">
                            Hi! I&apos;m{' '}
                            <span className="font-medium text-foreground">
                                Thang Le
                            </span>
                            . For most of the days, I dedicate most of my time to{' '}
                            <span className="text-foreground">web development</span>,{' '}
                            <span className="text-foreground">cybersecurity</span>,{' '}
                            <span className="text-muted-foreground">and</span>{' '}
                            <span className="text-foreground">IT systems</span>. I love taking ideas and build it into something that solve a genuine problem.
                        </p>
                        <div className="flex gap-4 flex-wrap mt-9 banner-button slide-up-and-fade">
                            <Button
                                as="button"
                                variant="primary"
                                onClick={() => lenis?.scrollTo('#contact')}
                            >
                                Get In Touch
                            </Button>
                            <a
                                href={resumeUrl}
                                download="Thang_Le_Resume.pdf"
                                className="group h-12 px-8 inline-flex justify-center items-center text-lg uppercase font-anton tracking-widest border border-border hover:border-primary hover:text-primary transition-colors overflow-hidden relative"
                            >
                                <span className="transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0 absolute">Résumé</span>
                                <span className="transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 absolute">Download</span>
                                <span className="invisible">Résumé</span>
                            </a>
                        </div>
                    </div>

                    <div className="slide-up-and-fade relative shrink-0 w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[390px] mx-auto lg:mx-0 mt-12 lg:mt-0">
                        <div className="relative overflow-hidden">
                            <Image
                                src="/me.png"
                                alt="Portrait of Thang Le"
                                width={768}
                                height={768}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>

                <div className="md:absolute bottom-8 left-0 right-0 flex gap-8 md:gap-0 md:justify-between border-t border-border pt-6 mt-8 md:mt-0">
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1">
                            University of Central Florida
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            School
                        </p>
                    </div>
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1">
                            3+
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            Projects
                        </p>
                    </div>
                    <div className="slide-up-and-fade">
                        <h5 className="text-2xl sm:text-3xl font-anton text-primary mb-1">
                            2027
                        </h5>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">
                            Graduating
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
