import { notFound } from 'next/navigation';
import ProjectDetails from './_components/ProjectDetails';
import { PROJECTS } from '@/lib/data';
import { Metadata } from 'next';

export const generateStaticParams = async () => {
    return PROJECTS.map((p) => ({ slug: p.slug }));
};

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
    const { slug } = await params;
    const project = PROJECTS.find((p) => p.slug === slug) ?? null;
    return {
        title: project
            ? `${project.title} - ${project.techStack.slice(0, 3).join(', ')}`
            : 'Project',
        description: project?.description ?? '',
    };
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const project = PROJECTS.find((p) => p.slug === slug) ?? null;

    if (!project) {
        return notFound();
    }

    return <ProjectDetails project={project} />;
};

export default Page;
