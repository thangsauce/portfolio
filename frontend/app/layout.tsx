import type { Metadata } from 'next';
import { Anton, DM_Sans, Roboto_Flex, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactLenis } from 'lenis/react';

import 'lenis/dist/lenis.css';
import './globals.css';
import Footer from '@/components/Footer';
import ScrollProgressIndicator from '@/components/ScrollProgressIndicator';
import Navbar from '@/components/Navbar';
import Preloader from '../components/Preloader';
import StickyEmail from './_components/StickyEmail';


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

const dmSans = DM_Sans({
    weight: ['400', '500', '700'],
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-google-sans',
});

const spaceGrotesk = Space_Grotesk({
    weight: ['700'],
    subsets: ['latin'],
    variable: '--font-space-grotesk',
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
                className={`${antonFont.variable} ${robotoFlex.variable} ${dmSans.variable} ${spaceGrotesk.variable} antialiased`}
            >
                <AuthProvider>
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

                        <Preloader />
                        <ScrollProgressIndicator />
                        <StickyEmail />
                    </ReactLenis>
                </AuthProvider>
            </body>
        </html>
    );
}
