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
    category: 'web_development' | 'cybersecurity' | 'it_systems' | null;
    tech_stack: string[];
    images: { thumbnail: string; long: string; gallery: string[] } | null;
    featured: boolean;
    order_index: number;
}

type ProjectGroupKey = 'web_development' | 'cybersecurity' | 'it_systems';
type GroupedProjects = Record<ProjectGroupKey, IProject[]>;
type CategoryOption = { key: ProjectGroupKey; title: string };

function mapProject(p: ApiProject): IProject {
    return {
        title: p.title,
        slug: p.slug,
        year: new Date().getFullYear(),
        description: p.description ?? '',
        role: '',
        category: p.category ?? 'web_development',
        techStack: p.tech_stack ?? [],
        thumbnail: p.images?.thumbnail ?? '',
        longThumbnail: p.images?.long || undefined,
        images: p.images?.gallery ?? [],
    };
}

function groupProjects(projects: IProject[]): GroupedProjects {
    return projects.reduce<GroupedProjects>(
        (acc, project) => {
            const category = (project.category ?? 'web_development') as ProjectGroupKey;
            acc[category].push(project);
            return acc;
        },
        { web_development: [], cybersecurity: [], it_systems: [] },
    );
}

const ProjectList = () => {
    const containerRef    = useRef<HTMLDivElement>(null);
    const projectListRef  = useRef<HTMLDivElement>(null);
    const imageContainer  = useRef<HTMLDivElement>(null);
    const imageRef        = useRef<HTMLImageElement>(null);

    const [projects, setProjects] = useState<IProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<ProjectGroupKey>('web_development');
    const [activeIndex, setActiveIndex] = useState<Record<ProjectGroupKey, number>>({
        web_development: 0,
        cybersecurity: 0,
        it_systems: 0,
    });

    useEffect(() => {
        apiFetch<ApiProject[]>('/api/portfolio/projects')
            .then((data) => {
                const mapped = data
                    .filter((project) => project.featured)
                    .map(mapProject);
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

    const grouped = groupProjects(projects);
    const categories: CategoryOption[] = [
        { key: 'web_development', title: 'Web Development' },
        { key: 'cybersecurity', title: 'Cybersecurity' },
        { key: 'it_systems', title: 'IT Systems' },
    ];
    const activeProjects = grouped[activeCategory];
    const currentIndex = Math.min(activeIndex[activeCategory], Math.max(0, activeProjects.length - 1));
    const currentProject = activeProjects[currentIndex];

    useEffect(() => {
        if (!currentProject) {
            setSelectedProject(null);
            return;
        }
        if (window.innerWidth >= 768) {
            setSelectedProject(currentProject.slug);
        }
    }, [currentProject?.slug]);

    const flipProject = (direction: 1 | -1) => {
        if (activeProjects.length <= 1) return;
        setActiveIndex((prev) => {
            const count = activeProjects.length;
            const next = (prev[activeCategory] + direction + count) % count;
            return { ...prev, [activeCategory]: next };
        });
    };

    if (projects.length === 0) return null;

    return (
        <section className="pb-section" id="selected-projects">
            <div className="container">
                <div className="flex items-center gap-3 mb-10">
                    <span className="text-primary font-mono text-xl leading-none select-none">&lt;</span>
                    <h2 className="text-xl uppercase leading-none tracking-widest">
                        PROJECTS
                    </h2>
                    <span className="text-primary font-mono text-xl leading-none select-none">&gt;</span>
                </div>

                <div className="group/projects relative" ref={containerRef}>
                    {selectedProject !== null && (
                        <div
                            className="max-md:hidden absolute -right-20 xl:-right-28 top-0 z-[1] pointer-events-none w-[200px] xl:w-[350px] aspect-[3/4] overflow-hidden opacity-0"
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
                        <div className="mb-6 flex flex-wrap items-center gap-2.5">
                            {categories.map((category) => (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() => setActiveCategory(category.key)}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-xs sm:text-sm uppercase tracking-[0.16em] transition-all',
                                        activeCategory === category.key
                                            ? 'border-primary/55 bg-primary/15 text-primary'
                                            : 'border-border text-muted-foreground hover:border-primary/35 hover:text-foreground',
                                    )}
                                >
                                    {category.title}
                                </button>
                            ))}
                        </div>

                        <div className="mb-6 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => flipProject(-1)}
                                disabled={activeProjects.length <= 1}
                                className="h-9 w-9 rounded-full border border-border text-foreground disabled:opacity-35 disabled:cursor-not-allowed hover:border-primary/45 hover:text-primary transition-colors"
                                aria-label="Previous project"
                            >
                                ‹
                            </button>
                            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                {activeProjects.length > 0 ? `${currentIndex + 1} / ${activeProjects.length}` : '0 / 0'}
                            </span>
                            <button
                                type="button"
                                onClick={() => flipProject(1)}
                                disabled={activeProjects.length <= 1}
                                className="h-9 w-9 rounded-full border border-border text-foreground disabled:opacity-35 disabled:cursor-not-allowed hover:border-primary/45 hover:text-primary transition-colors"
                                aria-label="Next project"
                            >
                                ›
                            </button>
                        </div>

                        {currentProject ? (
                            <Project
                                index={currentIndex}
                                project={currentProject}
                                selectedProject={selectedProject}
                                onMouseEnter={handleMouseEnter}
                                key={`${activeCategory}-${currentProject.slug}`}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">No projects in this category yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProjectList;
