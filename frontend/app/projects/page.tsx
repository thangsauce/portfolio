import { Suspense } from 'react';
import ProjectsPageClient from './ProjectsPageClient';

export default function ProjectsPage() {
    return (
        <Suspense
            fallback={
                <section className="pt-24 pb-16">
                    <div className="container text-sm uppercase tracking-[0.18em] text-muted-foreground">
                        loading project...
                    </div>
                </section>
            }
        >
            <ProjectsPageClient />
        </Suspense>
    );
}
