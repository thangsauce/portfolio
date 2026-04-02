'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProjectDetails from './[slug]/_components/ProjectDetails';
import { IProject } from '@/types';
import { normalizeProjectAssetUrl } from '@/lib/projectAssets';

type ApiProject = {
    title: string;
    slug: string;
    description: string | null;
    done_for?: string | null;
    category: 'web_development' | 'cybersecurity' | 'network' | 'it_systems' | null;
    tech_stack: string[];
    images: { thumbnail: string; long: string; gallery: string[] } | null;
    year: number | null;
    source_code_url?: string | null;
    live_url?: string | null;
};

function mapProject(p: ApiProject): IProject {
    return {
        title: p.title,
        slug: p.slug,
        year: p.year ?? new Date().getFullYear(),
        description: p.description ?? '',
        doneFor: p.done_for ?? '',
        role: '',
        category: p.category === 'it_systems' ? 'network' : (p.category ?? 'web_development'),
        techStack: p.tech_stack ?? [],
        thumbnail: normalizeProjectAssetUrl(p.images?.thumbnail),
        longThumbnail: normalizeProjectAssetUrl(p.images?.long) || undefined,
        images: (p.images?.gallery ?? []).map((img) => normalizeProjectAssetUrl(img)),
        sourceCode: p.source_code_url ?? undefined,
        liveUrl: p.live_url ?? undefined,
    };
}

export default function ProjectsPageClient() {
    const searchParams = useSearchParams();
    const slug = useMemo(() => (searchParams.get('slug') ?? '').trim(), [searchParams]);
    const [project, setProject] = useState<IProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!slug) {
            setProject(null);
            setError('missing slug');
            setLoading(false);
            return;
        }

        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/projects/${encodeURIComponent(slug)}`);
                if (!res.ok) throw new Error('project_not_found');
                const data = (await res.json()) as ApiProject;
                if (cancelled) return;
                setProject(mapProject(data));
            } catch {
                if (cancelled) return;
                setProject(null);
                setError('project_not_found');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <section className="pt-24 pb-16">
                <div className="container text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    loading project...
                </div>
            </section>
        );
    }

    if (!project) {
        return (
            <section className="pt-24 pb-16">
                <div className="container text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    {error === 'missing slug' ? 'project slug missing' : 'project not found'}
                </div>
            </section>
        );
    }

    return <ProjectDetails project={project} />;
}
