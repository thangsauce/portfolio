import TransitionLink from '@/components/TransitionLink';
import { cn } from '@/lib/utils';
import { IProject } from '@/types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ExternalLink, Github } from 'lucide-react';
import { useRef } from 'react';

interface Props {
    index: number;
    project: IProject;
    selectedProject: string | null;
    onMouseEnter: (_slug: string) => void;
}

/*
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
    <path id="arrow-line" d="M15 3h6v6"></path>
    <path id="arrow-curb" d="M10 14 21 3"></path>
    <path id="box" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
</svg>

<svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M39.9996 6.18259H10.2846C5.70915 6.18259 2 9.89172 2 14.4672V60.0324C2 64.6079 5.70914 68.317 10.2846 68.317H55.8498C60.4253 68.317 64.1344 64.6079 64.1344 60.0324V24.9401" stroke="#DDDDDD" stroke-width="3.10672" stroke-linecap="round"/>
<rect x="38.2451" y="30.0007" width="40.3874" height="3.10672" rx="1.55336" transform="rotate(-45 38.2451 30.0007)" fill="#DDDDDD"/>
<path d="M58.5561 3.23069L67.9426 1.59357C68.1983 1.54899 68.4231 1.76656 68.387 2.02352L67.0827 11.2992" stroke="#DDDDDD" stroke-width="2.07115" stroke-linecap="round"/>
</svg>

*/

gsap.registerPlugin(useGSAP);

const Project = ({ index, project, selectedProject, onMouseEnter }: Props) => {
    const externalLinkSVGRef = useRef<SVGSVGElement>(null);
    const fallbackThumbnail = '/projects/thumbnail/portfolio-thumbnail.jpg';

    const { context, contextSafe } = useGSAP(() => {}, {
        scope: externalLinkSVGRef,
        revertOnUpdate: true,
    });

    const handleMouseEnter = contextSafe?.(() => {
        onMouseEnter(project.slug);

        const arrowLine = externalLinkSVGRef.current?.querySelector(
            '#arrow-line',
        ) as SVGPathElement;
        const arrowCurb = externalLinkSVGRef.current?.querySelector(
            '#arrow-curb',
        ) as SVGPathElement;
        const box = externalLinkSVGRef.current?.querySelector(
            '#box',
        ) as SVGPathElement;

        gsap.set(box, {
            opacity: 0,
            strokeDasharray: box?.getTotalLength(),
            strokeDashoffset: box?.getTotalLength(),
        });
        gsap.set(arrowLine, {
            opacity: 0,
            strokeDasharray: arrowLine?.getTotalLength(),
            strokeDashoffset: arrowLine?.getTotalLength(),
        });
        gsap.set(arrowCurb, {
            opacity: 0,
            strokeDasharray: arrowCurb?.getTotalLength(),
            strokeDashoffset: arrowCurb?.getTotalLength(),
        });

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        tl.to(externalLinkSVGRef.current, {
            autoAlpha: 1,
        })
            .to(box, {
                opacity: 1,
                strokeDashoffset: 0,
            })
            .to(
                arrowLine,
                {
                    opacity: 1,
                    strokeDashoffset: 0,
                },
                '<0.2',
            )
            .to(arrowCurb, {
                opacity: 1,
                strokeDashoffset: 0,
            })
            .to(
                externalLinkSVGRef.current,
                {
                    autoAlpha: 0,
                },
                '+=1',
            );
    });

    const handleMouseLeave = contextSafe?.(() => {
        context.kill();
    });

    return (
        <div
            className="project-item group leading-none py-5 first:!pt-0 last:pb-0 md:group-hover/projects:opacity-30 md:hover:!opacity-100 transition-all"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {selectedProject === null && project.thumbnail && (
                <img
                    src={project.thumbnail}
                    alt="Project"
                    className={cn(
                        'w-full object-cover mb-6 aspect-[3/2] object-top',
                    )}
                    key={project.slug}
                    loading="lazy"
                    onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallbackApplied === '1') {
                            img.style.opacity = '0';
                            return;
                        }
                        img.dataset.fallbackApplied = '1';
                        img.src = fallbackThumbnail;
                    }}
                />
            )}
            <div className="flex gap-2 md:gap-5">
                <div className="font-anton text-muted-foreground">
                    _{(index + 1).toString().padStart(2, '0')}.
                </div>
                <div className="">
                    <div className="flex items-start justify-between gap-4">
                        <TransitionLink href={`/projects?slug=${encodeURIComponent(project.slug)}`} className="min-w-0">
                            <h4 className="text-4xl xs:text-6xl flex gap-4 font-anton transition-all duration-700 bg-gradient-to-r from-primary to-foreground from-[50%] to-[50%] bg-[length:200%] bg-right bg-clip-text text-transparent group-hover:bg-left">
                                {project.title}
                                <span className="text-foreground opacity-0 group-hover:opacity-100 transition-all">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="36"
                                        height="36"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        ref={externalLinkSVGRef}
                                    >
                                        <path
                                            id="box"
                                            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                        ></path>
                                        <path id="arrow-line" d="M10 14 21 3"></path>
                                        <path id="arrow-curb" d="M15 3h6v6"></path>
                                    </svg>
                                </span>
                            </h4>
                        </TransitionLink>
                        {(project.sourceCode || project.liveUrl) && (
                            <div className="inline-flex items-center justify-center gap-2.5 pt-2 shrink-0">
                                {project.sourceCode && (
                                    <a
                                        href={project.sourceCode}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="inline-flex items-center justify-center size-11 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/45 transition-colors"
                                        aria-label={`${project.title} GitHub`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Github size={22} />
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="inline-flex items-center justify-center size-11 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/45 transition-colors"
                                        aria-label={`${project.title} website`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink size={22} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-muted-foreground text-xs">
                        {project.techStack
                            .slice(0, 3)
                            .map((tech, idx, stackArr) => (
                                <div
                                    className="gap-3 flex items-center"
                                    key={tech}
                                >
                                    <span className="">{tech}</span>
                                    {idx !== stackArr.length - 1 && (
                                        <span className="inline-block size-2 rounded-full bg-background-light"></span>
                                    )}
                                </div>
                            ))}
                    </div>
                    {project.description && (
                        <p className="max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed overflow-hidden transition-all duration-500 ease-out max-md:mt-3 max-md:max-h-40 max-md:opacity-100 md:mt-0 md:max-h-0 md:opacity-0 md:group-hover:mt-3 md:group-hover:max-h-40 md:group-hover:opacity-100">
                            {project.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Project;
