'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof Link> {
    back?: boolean;
}

const TransitionLink = ({
    href,
    onClick,
    children,
    back = false,
    ...rest
}: Props) => {
    const router = useRouter();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (back) {
            e.preventDefault();
            router.back();
            return;
        }
        onClick?.(e);
    };

    return (
        <Link href={href} {...rest} onClick={handleLinkClick}>
            {children}
        </Link>
    );
};

export default TransitionLink;
