import { IProject } from '@/types';

// Static personal info — not stored in DB
export const GENERAL_INFO = {
    email: 'th432726@ucf.edu',

    emailSubject: "Let's connect!",
    emailBody: "Hi Thang, I'd like to reach out about...",

    linkedinProfile: 'https://linkedin.com/in/thang-le-it',
    githubProfile: 'https://github.com/thangsauce',
};

export const SOCIAL_LINKS = [
    { name: 'github', url: 'https://github.com/thangsauce' },
    { name: 'linkedin', url: 'https://linkedin.com/in/thang-le-it' },
];

// MY_STACK moved to API: GET /api/portfolio/skills (categories: frontend, backend, database, tools)
// IT_SKILLS moved to API: GET /api/portfolio/skills (category: it_support)
// CERTIFICATIONS moved to API: GET /api/portfolio/certifications
// MY_EXPERIENCE moved to API: GET /api/portfolio/experiences

// PROJECTS is kept here for Next.js generateStaticParams (static export requires build-time slugs)
export const PROJECTS: IProject[] = [
    {
        title: 'Portfolio Website',
        slug: 'portfolio',
        year: 2026,
        sourceCode: 'https://github.com/thangsauce',
        description: `
      My personal developer portfolio built to showcase my skills, experience, and projects. <br/><br/>

      Key Features:<br/>
      <ul>
        <li>🎨 Smooth scroll animations powered by GSAP and Lenis</li>
        <li>📱 Fully responsive design across all screen sizes</li>
        <li>⚡ Fast performance with Next.js and Tailwind CSS</li>
        <li>🌙 Dark themed with custom cursor and particle background</li>
      </ul>
      `,
        role: `
      Full-Stack Developer / Designer<br/>
      <ul>
        <li>✅ Built the entire site from scratch using Next.js and TypeScript</li>
        <li>🎨 Designed and implemented all animations with GSAP ScrollTrigger</li>
        <li>📦 Configured Tailwind CSS with custom design tokens</li>
      </ul>
      `,
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Lenis'],
        thumbnail: '/projects/thumbnail/portfolio-thumbnail.jpg',
        longThumbnail: '/projects/long/portfolio-long.jpg',
        images: [
            '/projects/images/portfolio-1.jpg',
            '/projects/images/portfolio-2.jpg',
            '/projects/images/portfolio-3.jpg',
        ],
    },
    {
        title: 'CampusLab SIEM',
        slug: 'campuslab-siem',
        sourceCode: 'https://github.com/project-vigil-knighthacks/vigil',
        techStack: ['Python', 'Log Analysis', 'Security Monitoring', 'React'],
        thumbnail: '/projects/thumbnail/epikcart.jpg',
        images: [
            '/projects/images/epikcart-1.png',
            '/projects/images/epikcart-2.png',
        ],
        year: 2026,
        description: `A centralized security monitoring system built under hackathon conditions that aggregates logs from multiple sources and flags suspicious activity in real time. Demonstrates practical application of SIEM concepts in a campus environment.<br/><br/>
        Built at KnightHacks Hackathon — aggregates logs from multiple sources and flags suspicious activity in real time.`,
        role: `As a developer on the team, I:<br/>
        - Designed the log ingestion pipeline to normalize data from multiple sources.<br/>
        - Built real-time alerting rules to detect anomalous patterns.<br/>
        - Created the dashboard UI to surface alerts and activity timelines.<br/>
        - Presented the project and defended architecture decisions to judges.`,
    },
    {
        title: 'Aromamor',
        slug: 'aromamor',
        sourceCode: 'https://github.com/thangsauce/aromamor-candles',
        techStack: ['React', 'Tailwind CSS', 'Component Architecture', 'E-Commerce'],
        thumbnail: '/projects/thumbnail/resume-roaster.jpg',
        images: [
            '/projects/images/resume-roaster-1.png',
            '/projects/images/resume-roaster-2.png',
        ],
        year: 2026,
        description:
            'Modern e-commerce style website for a candle brand demonstrating responsive UI and component-based architecture. Built with a focus on clean design, reusable components, and a smooth user experience.',
        role: `As the developer, I:<br/>
        - Built the storefront UI with React and Tailwind CSS.<br/>
        - Designed reusable product card and cart components.<br/>
        - Ensured full responsiveness across mobile and desktop.<br/>
        - Focused on clean visual hierarchy and interactive shopping experience.`,
    },
    {
        title: 'ArenaOps',
        slug: 'arenaops',
        sourceCode: 'https://github.com/thangsauce/ArenaOps',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        thumbnail: '/projects/thumbnail/property-pro.jpg',
        images: [
            '/projects/images/property-pro-1.png',
            '/projects/images/property-pro-2.png',
        ],
        year: 2026,
        description:
            'Full-featured platform for organizing esports tournaments — handles bracket generation, match scheduling, and participant tracking with a clean admin dashboard.',
        role: `As the developer, I:<br/>
        - Built automated bracket generation logic for single and double elimination formats.<br/>
        - Implemented match scheduling with conflict detection.<br/>
        - Created an admin dashboard for managing participants and results.<br/>
        - Designed a participant-facing view for tracking standings and upcoming matches.`,
    },
];
