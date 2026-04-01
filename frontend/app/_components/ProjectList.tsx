'use client';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { IProject } from '@/types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Image from 'next/image';
import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import Project from './Project';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ApiProject = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    tech_stack: string[];
    images: { thumbnail: string; long: string; gallery: string[] } | null;
    featured: boolean;
    order_index: number;
}

function mapProject(p: ApiProject): IProject {
    return {
        title: p.title,
        slug: p.slug,
        year: new Date().getFullYear(),
        description: p.description ?? '',
        role: '',
        techStack: p.tech_stack ?? [],
        thumbnail: p.images?.thumbnail ?? '',
        longThumbnail: p.images?.long || undefined,
        images: p.images?.gallery ?? [],
    };
}

const ProjectList = () => {
    const containerRef    = useRef<HTMLDivElement>(null);
    const projectListRef  = useRef<HTMLDivElement>(null);
    const imageContainer  = useRef<HTMLDivElement>(null);
    const imageRef        = useRef<HTMLImageElement>(null);

    const [projects, setProjects] = useState<IProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<ApiProject[]>('/api/portfolio/projects')
            .then((data) => {
                const mapped = data.map(mapProject);
                setProjects(mapped);
                if (mapped.length > 0 && window.innerWidth >= 768) {
                    setSelectedProject(mapped[0].slug);
                }
            })
            .catch(() => {});
    }, []);

    // update imageRef.current href based on the cursor hover position
    // also update image position
    useGSAP(
        (context, contextSafe) => {
            if (projects.length === 0) return;

            // show image on hover
            if (window.innerWidth < 768) {
                setSelectedProject(null);
                return;
            }

            const handleMouseMove = contextSafe?.((e: MouseEvent) => {
                if (!containerRef.current) return;
                if (!imageContainer.current) return;

                if (window.innerWidth < 768) {
                    setSelectedProject(null);
                    return;
                }

                const containerRect = containerRef.current?.getBoundingClientRect();
                const imageRect     = imageContainer.current.getBoundingClientRect();
                const offsetTop     = e.clientY - containerRect.y;

                // if cursor is outside the container, hide the image
                if (
                    containerRect.y > e.clientY ||
                    containerRect.bottom < e.clientY ||
                    containerRect.x > e.clientX ||
                    containerRect.right < e.clientX
                ) {
                    return gsap.to(imageContainer.current, { duration: 0.3, opacity: 0 });
                }

                gsap.to(imageContainer.current, {
                    y: offsetTop - imageRect.height / 2,
                    duration: 1,
                    opacity: 1,
                });
            }) as any;

            window.addEventListener('mousemove', handleMouseMove);
            return () => { window.removeEventListener('mousemove', handleMouseMove); };
        },
        { scope: containerRef, dependencies: [projects.length, containerRef.current] },
    );

    useGSAP(
        () => {
            if (projects.length === 0) return;
            const isHorizontalMode = window.innerWidth >= 1024 && !!document.querySelector('.horizontal-mode');
            if (isHorizontalMode) {
                gsap.from(containerRef.current, { y: 80, opacity: 0, duration: 0.9, ease: 'power2.out' });
                return;
            }
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'top 80%',
                    toggleActions: 'restart none none reverse',
                    scrub: 1,
                },
            });
            tl.from(containerRef.current, { y: 150, opacity: 0 });
        },
        { scope: containerRef, dependencies: [projects.length] },
    );

    const handleMouseEnter = (slug: string) => {
        if (window.innerWidth < 768) { setSelectedProject(null); return; }
        setSelectedProject(slug);
    };

    if (projects.length === 0) return null;

    return (
        <section className="pb-section" id="selected-projects">
            <div className="container">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
                    <h2 className="text-xl uppercase leading-none tracking-widest">
                        FEATURED PROJECTS
                    </h2>
                    <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
                </div>

                <div className="group/projects relative" ref={containerRef}>
                    {selectedProject !== null && (
                        <div
                            className="max-md:hidden absolute right-0 top-0 z-[1] pointer-events-none w-[200px] xl:w-[350px] aspect-[3/4] overflow-hidden opacity-0"
                            ref={imageContainer}
                        >
                            {projects.filter(p => p.thumbnail).map((project) => (
                                <Image
                                    src={project.longThumbnail ?? project.thumbnail}
                                    alt="Project"
                                    width={400}
                                    height={500}
                                    className={cn(
                                        'absolute inset-0 transition-all duration-500 w-full h-full object-cover',
                                        { 'opacity-0': project.slug !== selectedProject },
                                    )}
                                    ref={imageRef}
                                    key={project.slug}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col max-md:gap-10" ref={projectListRef}>
                        {projects.map((project, index) => (
                            <Project
                                index={index}
                                project={project}
                                selectedProject={selectedProject}
                                onMouseEnter={handleMouseEnter}
                                key={project.slug}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectList;
