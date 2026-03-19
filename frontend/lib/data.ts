import { IProject } from '@/types';

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

export const MY_STACK = {
    frontend: [
        {
            name: 'JavaScript',
            icon: '/logo/js.png',
        },
        {
            name: 'TypeScript',
            icon: '/logo/ts.png',
        },
        {
            name: 'React',
            icon: '/logo/react.png',
        },
        {
            name: 'Next.js',
            icon: '/logo/next.png',
        },
        {
            name: 'Tailwind CSS',
            icon: '/logo/tailwind.png',
        },
        {
            name: 'Bootstrap',
            icon: '/logo/bootstrap.svg',
        },
    ],
    backend: [
        {
            name: 'Python',
            icon: '/logo/python.svg',
        },
        {
            name: 'Java',
            icon: '/logo/java.svg',
        },
        {
            name: 'Node.js',
            icon: '/logo/node.png',
        },
    ],
    database: [
        {
            name: 'MySQL',
            icon: '/logo/mysql.svg',
        },
        {
            name: 'PostgreSQL',
            icon: '/logo/postgreSQL.png',
        },
        {
            name: 'MongoDB',
            icon: '/logo/mongodb.svg',
        },
    ],
    tools: [
        {
            name: 'Git',
            icon: '/logo/git.png',
        },
        {
            name: 'VS Code',
            icon: '/logo/vscode.png',
        },
        {
            name: 'Linux',
            icon: '/logo/linux.png',
        },
    ],
};

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

export const IT_SKILLS = [
    { id: 1, text: 'Troubleshooting hardware and software issues (PCs, laptops, printers, etc.)' },
    { id: 2, text: 'Basic networking knowledge (Wi-Fi configuration, setup, troubleshooting, etc.)' },
    { id: 3, text: 'Proficiency in Windows OS, Mac OS, and Linux OS' },
    { id: 4, text: 'Experience with Microsoft Office Suite and Google Workspace' },
    { id: 5, text: 'Excellent verbal and written communication skills for customer support' },
];

export const CERTIFICATIONS = [
    {
        id: 1,
        name: 'CompTIA IT Fundamentals+',
        issuer: 'TestOut',
        date: 'Apr 2025',
        cert_id: '6-1C6-VPVCKB',
        url: 'https://certification.testout.com/verifycert/6-1C6-VPVCKB',
    },
];

export const MY_EXPERIENCE = [
    {
        title: 'IT Support Specialist',
        company: 'Craze Nails Salon — Lake Mary, FL',
        duration: '2023 – Present',
    },
    {
        title: 'IT Student',
        company: 'University of Central Florida — Orlando, FL',
        duration: 'Aug 2022 – Present',
    },
    {
        title: 'Sushi Chef',
        company: 'Sushi Pop — Winter Park, FL',
        duration: '2017 – 2019',
    },
];
