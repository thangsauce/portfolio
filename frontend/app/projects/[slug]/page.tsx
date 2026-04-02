import { notFound } from 'next/navigation';
import ProjectDetails from './_components/ProjectDetails';
import { Metadata } from 'next';
import { IProject } from '@/types';
import { normalizeProjectAssetUrl } from '@/lib/projectAssets';

type ApiProject = {
    title: string;
    slug: string;
    description: string | null;
    done_for?: string | null;
    category: 'web_development' | 'cybersecurity' | 'network' | null;
    tech_stack: string[];
    images: { thumbnail: string; long: string; gallery: string[] } | null;
    year: number | null;
    source_code_url?: string | null;
    live_url?: string | null;
};

async function fetchProjects(): Promise<ApiProject[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/projects`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        const projects = (await res.json()) as ApiProject[];
        return Array.isArray(projects) ? projects : [];
    } catch {
        return [];
    }
}

async function fetchProjectBySlug(slug: string): Promise<ApiProject | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolio/projects/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return (await res.json()) as ApiProject;
    } catch {
        return null;
    }
}

function mapProject(p: ApiProject): IProject {
    return {
        title: p.title,
        slug: p.slug,
        year: p.year ?? new Date().getFullYear(),
        description: p.description ?? '',
        doneFor: p.done_for ?? '',
        role: '',
        category: p.category ?? 'web_development',
        techStack: p.tech_stack ?? [],
        thumbnail: normalizeProjectAssetUrl(p.images?.thumbnail),
        longThumbnail: normalizeProjectAssetUrl(p.images?.long) || undefined,
        images: (p.images?.gallery ?? []).map((img) => normalizeProjectAssetUrl(img)),
        sourceCode: p.source_code_url ?? undefined,
        liveUrl: p.live_url ?? undefined,
    };
}

export const generateStaticParams = async () => {
    const projects = await fetchProjects();
    if (projects.length === 0) return [{ slug: '_' }];
    return projects.map((p) => ({ slug: p.slug }));
};

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
    const { slug } = await params;
    const project = await fetchProjectBySlug(slug);
    const mapped = project ? mapProject(project) : null;
    return {
        title: mapped
            ? `${mapped.title} - ${mapped.techStack.slice(0, 3).join(', ')}`
            : 'Project',
        description: mapped?.description ?? '',
    };
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const project = await fetchProjectBySlug(slug);

    if (!project) {
        return notFound();
    }

    return <ProjectDetails project={mapProject(project)} />;
};

export default Page;
