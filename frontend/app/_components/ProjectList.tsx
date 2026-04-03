'use client';
/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { normalizeProjectAssetUrl } from '@/lib/projectAssets';
import { IProject } from '@/types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React, { useRef, useState, useEffect, MouseEvent } from 'react';
import Project from './Project';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ApiProject = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    done_for?: string | null;
    category: 'web_development' | 'cybersecurity' | 'network' | 'it_systems' | null;
    tech_stack: string[];
    source_code_url?: string | null;
    live_url?: string | null;
    images: { thumbnail: string; long: string; gallery: string[] } | null;
    featured: boolean;
    order_index: number;
}

type ProjectGroupKey = 'web_development' | 'cybersecurity' | 'network';
type GroupedProjects = Record<ProjectGroupKey, IProject[]>;
type CategoryOption = { key: ProjectGroupKey; title: string };
type ProjectCategoryEvent = CustomEvent<ProjectGroupKey>;

function mapProject(p: ApiProject): IProject {
    const slug = p.slug.toLowerCase();
    const title = p.title.toLowerCase();
    const isCampusLabSiem =
        (slug.includes('campuslab') && slug.includes('siem')) ||
        (title.includes('campuslab') && title.includes('siem'));

    return {
        title: p.title,
        slug: p.slug,
        year: new Date().getFullYear(),
        description: p.description ?? '',
        doneFor: p.done_for ?? '',
        role: '',
        category: isCampusLabSiem
            ? 'cybersecurity'
            : (p.category === 'it_systems' ? 'network' : (p.category ?? 'web_development')),
        techStack: p.tech_stack ?? [],
        thumbnail: normalizeProjectAssetUrl(p.images?.thumbnail),
        longThumbnail: normalizeProjectAssetUrl(p.images?.long) || undefined,
        images: (p.images?.gallery ?? []).map((img) => normalizeProjectAssetUrl(img)),
        sourceCode: p.source_code_url ?? undefined,
        liveUrl: p.live_url ?? undefined,
    };
}

function groupProjects(projects: IProject[]): GroupedProjects {
    return projects.reduce<GroupedProjects>(
        (acc, project) => {
            const category = (project.category ?? 'web_development') as ProjectGroupKey;
            acc[category].push(project);
            return acc;
        },
        { web_development: [], cybersecurity: [], network: [] },
    );
}

const ProjectList = () => {
    const containerRef    = useRef<HTMLDivElement>(null);
    const projectListRef  = useRef<HTMLDivElement>(null);
    const imageContainer  = useRef<HTMLDivElement>(null);
    const imageRef        = useRef<HTMLImageElement>(null);
    const pagePanelRef    = useRef<HTMLDivElement>(null);
    const hasAnimatedPage = useRef(false);
    const fallbackPreview = '/projects/thumbnail/portfolio-thumbnail.jpg';

    const [projects, setProjects] = useState<IProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<ProjectGroupKey>('web_development');
    const [flipDirection, setFlipDirection] = useState<1 | -1>(1);
    const [isMobile, setIsMobile] = useState(false);
    const [activePage, setActivePage] = useState<Record<ProjectGroupKey, number>>({
        web_development: 0,
        cybersecurity: 0,
        network: 0,
    });

    useEffect(() => {
        apiFetch<ApiProject[]>('/api/portfolio/projects')
            .then((data) => {
                const mapped = data
                    .filter((project) => project.featured)
                    .map(mapProject);
                setProjects(mapped);
                if (mapped.length > 0 && window.innerWidth >= 768) {
                    const initialWithImage = mapped.find(
                        (project) => project.thumbnail || project.longThumbnail,
                    );
                    setSelectedProject(initialWithImage ? initialWithImage.slug : null);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handleCategoryJump = (event: Event) => {
            const customEvent = event as ProjectCategoryEvent;
            const category = customEvent.detail;
            if (!category) return;
            setFlipDirection(1);
            setActiveCategory(category);
            setActivePage((prev) => ({ ...prev, [category]: 0 }));
        };

        window.addEventListener(
            'portfolio:project-category',
            handleCategoryJump as EventListener,
        );
        return () => {
            window.removeEventListener(
                'portfolio:project-category',
                handleCategoryJump as EventListener,
            );
        };
    }, []);

    useEffect(() => {
        const updateViewport = () => setIsMobile(window.innerWidth < 768);
        updateViewport();
        window.addEventListener('resize', updateViewport, { passive: true });
        return () => window.removeEventListener('resize', updateViewport);
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
            const isHorizontalMode = window.innerWidth >= 768 && !!document.querySelector('.horizontal-mode');
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
        { key: 'network', title: 'Network' },
    ];
    const currentCategoryIndex = categories.findIndex((c) => c.key === activeCategory);
    const activeProjects = grouped[activeCategory];
    const itemsPerPage = isMobile ? Math.max(1, activeProjects.length) : 2;
    const totalPages = Math.max(1, Math.ceil(activeProjects.length / itemsPerPage));
    const currentPage = Math.min(activePage[activeCategory], totalPages - 1);
    const startIndex = currentPage * itemsPerPage;
    const currentProjects = activeProjects.slice(startIndex, startIndex + itemsPerPage);
    const currentProject = currentProjects[0];

    useEffect(() => {
        if (!currentProject) {
            setSelectedProject(null);
            return;
        }
        if (window.innerWidth >= 768) {
            const firstWithImage = currentProjects.find(
                (project) => project.thumbnail || project.longThumbnail,
            );
            setSelectedProject(firstWithImage ? firstWithImage.slug : null);
        }
    }, [currentProject?.slug, currentProjects]);

    useGSAP(
        () => {
            if (!pagePanelRef.current || currentProjects.length === 0) return;

            if (!hasAnimatedPage.current) {
                hasAnimatedPage.current = true;
                return;
            }

            gsap.fromTo(
                pagePanelRef.current,
                { x: flipDirection * 52, autoAlpha: 0, filter: 'blur(4px)' },
                {
                    x: 0,
                    autoAlpha: 1,
                    filter: 'blur(0px)',
                    duration: 0.45,
                    ease: 'power2.out',
                    clearProps: 'filter',
                },
            );
        },
        {
            scope: containerRef,
            dependencies: [activeCategory, currentPage, currentProjects.length, flipDirection],
        },
    );

    const flipProject = (direction: 1 | -1) => {
        if (totalPages <= 1) return;
        setFlipDirection(direction);
        setActivePage((prev) => {
            const next = (prev[activeCategory] + direction + totalPages) % totalPages;
            return { ...prev, [activeCategory]: next };
        });
    };

    if (projects.length === 0) return null;

    return (
        <section className="pb-section -mt-10 md:mt-0" id="selected-projects">
            <div className="container">
                <div className="flex items-center gap-3 mb-0 md:mb-10">
                    <span className="text-primary [[data-theme='light']_&]:text-foreground/80 font-mono text-2xl leading-none select-none">&lt;</span>
                    <h2 className="text-2xl uppercase leading-none tracking-widest">
                        PROJECTS
                    </h2>
                    <span className="text-primary [[data-theme='light']_&]:text-foreground/80 font-mono text-2xl leading-none select-none">&gt;</span>
                </div>

                <div className="group/projects relative" ref={containerRef}>
                    {selectedProject !== null && projects.some((p) => p.thumbnail || p.longThumbnail) && (
                        <div
                            className="max-md:hidden absolute -right-20 xl:-right-28 top-0 z-[1] pointer-events-none w-[200px] xl:w-[350px] aspect-[3/4] overflow-hidden opacity-100"
                            ref={imageContainer}
                        >
                            {projects
                                .filter((project) => project.thumbnail || project.longThumbnail)
                                .map((project) => (
                                <img
                                    src={project.longThumbnail ?? project.thumbnail ?? ''}
                                    alt="Project"
                                    className={cn(
                                        'absolute inset-0 transition-all duration-500 w-full h-full object-cover',
                                        { 'opacity-0': project.slug !== selectedProject },
                                    )}
                                    key={project.slug}
                                    ref={project.slug === selectedProject ? imageRef : undefined}
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        if (img.dataset.fallbackApplied === '1') {
                                            img.style.opacity = '0';
                                            return;
                                        }
                                        img.dataset.fallbackApplied = '1';
                                        img.src = fallbackPreview;
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col max-md:gap-0 md:pr-[230px] xl:pr-[390px]" ref={projectListRef}>
                        <div className="mb-0 md:mb-6 flex flex-wrap items-center gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() => {
                                        const nextCategoryIndex = categories.findIndex((c) => c.key === category.key);
                                        setFlipDirection(nextCategoryIndex >= currentCategoryIndex ? 1 : -1);
                                        setActiveCategory(category.key);
                                    }}
                                    className={cn(
                                        'rounded-full border px-3 py-1 text-xs sm:text-sm uppercase tracking-[0.16em] transition-all',
                                        activeCategory === category.key
                                            ? 'border-primary/55 text-primary'
                                            : 'border-border text-muted-foreground hover:border-primary/35 hover:text-foreground',
                                    )}
                                >
                                    {category.title}
                                </button>
                            ))}
                        </div>

                        {!isMobile && (
                            <div className="mb-4 md:mb-6 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => flipProject(-1)}
                                    disabled={totalPages <= 1}
                                    className="h-9 w-9 rounded-full border border-border text-foreground disabled:opacity-35 disabled:cursor-not-allowed hover:border-white/40 hover:text-primary hover:shadow-[0_0_14px_rgba(255,255,255,0.1)] transition-all"
                                    aria-label="Previous project"
                                >
                                    ‹
                                </button>
                                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                    {activeProjects.length > 0 ? `${currentPage + 1} / ${totalPages}` : '0 / 0'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => flipProject(1)}
                                    disabled={totalPages <= 1}
                                    className="h-9 w-9 rounded-full border border-border text-foreground disabled:opacity-35 disabled:cursor-not-allowed hover:border-white/40 hover:text-primary hover:shadow-[0_0_14px_rgba(255,255,255,0.1)] transition-all"
                                    aria-label="Next project"
                                >
                                    ›
                                </button>
                            </div>
                        )}

                        {currentProjects.length > 0 ? (
                            <div
                                className="flex flex-col"
                                ref={pagePanelRef}
                                key={`${activeCategory}-${currentPage}`}
                            >
                                {currentProjects.map((project, i) => (
                                    <Project
                                        index={startIndex + i}
                                        project={project}
                                        selectedProject={selectedProject}
                                        onMouseEnter={handleMouseEnter}
                                        key={`${activeCategory}-${project.slug}`}
                                    />
                                ))}
                            </div>
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
