import type { Metadata } from 'next';
import { Anton, Roboto_Flex } from 'next/font/google';
import { ReactLenis } from 'lenis/react';

import 'lenis/dist/lenis.css';
import './globals.css';
import Footer from '@/components/Footer';
import ScrollProgressIndicator from '@/components/ScrollProgressIndicator';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '../components/Preloader';
import StickyEmail from './_components/StickyEmail';
import ThemeToggle from '@/components/ThemeToggle';


const antonFont = Anton({
    weight: '400',
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-anton',
});

const robotoFlex = Roboto_Flex({
    weight: ['100', '400', '500', '600', '700', '800'],
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-roboto-flex',
});

export const metadata: Metadata = {
    title: 'Thang Le — IT Specialist',
    description:
        'Portfolio of Thang Le, IT Specialist and UCF student. Web development, cybersecurity, and practical technology solutions.',
    openGraph: {
        title: 'Thang Le — IT Specialist',
        description:
            'IT Specialist & UCF student. Web development, cybersecurity, and practical technology solutions.',
        siteName: 'Thang Le Portfolio',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Thang Le — IT Specialist',
        description:
            'IT Specialist & UCF student. Web development, cybersecurity, and practical technology solutions.',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${antonFont.variable} ${robotoFlex.variable} antialiased`}
            >
                <ReactLenis
                        root
                        options={{
                            lerp: 0.1,
                            duration: 1.4,
                        }}
                    >
                        {/* <a
                            href="https://forms.gle/t73XYJgWD5cJNr6e8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 block bg-black text-center z-[1] text-sm py-2 hover:text-primary transition-all"
                        >
                            Frontend dev? I&apos;ll help you polish your resume —
                            completely free.
                        </a> */}
                        <Navbar />
                        <main>{children}</main>
                        <Footer />

                        <CustomCursor />
                        <Preloader />
                        <ScrollProgressIndicator />
                        <ParticleBackground />
                        <StickyEmail />
                        <ThemeToggle />
                    </ReactLenis>
            </body>
        </html>
    );
}
