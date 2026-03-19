import { cn } from '@/lib/utils';

interface Props {
    className?: string;
    classNames?: {
        container?: string;
        title?: string;
    };
    title: string;
}

const SectionTitle = ({ title, className, classNames }: Props) => {
    return (
        <div
            className={cn(
                'flex items-center gap-3 mb-10',
                className,
                classNames?.container,
            )}
        >
            <span className="text-primary font-mono text-xl leading-none select-none">[</span>
            <h2
                className={cn(
                    'text-xl uppercase leading-none tracking-widest',
                    classNames?.title,
                )}
            >
                {title}
            </h2>
            <span className="text-primary font-mono text-xl leading-none select-none">]</span>
        </div>
    );
};

export default SectionTitle;
