import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container min-h-[60vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-8xl font-anton text-primary mb-4">404</h1>
            <p className="text-xl text-muted-foreground mb-8">
                This page doesn&apos;t exist.
            </p>
            <Link
                href="/"
                className="h-12 px-8 inline-flex justify-center items-center text-lg uppercase font-anton tracking-widest border border-border hover:border-primary hover:text-primary transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
}
