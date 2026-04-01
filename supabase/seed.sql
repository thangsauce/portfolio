-- Seed data migrated from frontend/lib/data.ts
-- Run AFTER applying migrations 001 and 002

-- ── Skills: Tech Stack (MY_STACK) ─────────────────────────────────────────────
INSERT INTO skills (name, category, icon_url, order_index) VALUES
  -- Frontend
  ('JavaScript',   'frontend',  '/logo/js.png',         0),
  ('TypeScript',   'frontend',  '/logo/ts.png',         1),
  ('React',        'frontend',  '/logo/react.png',      2),
  ('Next.js',      'frontend',  '/logo/next.png',       3),
  ('Tailwind CSS', 'frontend',  '/logo/tailwind.png',   4),
  ('Bootstrap',    'frontend',  '/logo/bootstrap.svg',  5),
  -- Backend
  ('Python',       'backend',   '/logo/python.svg',     0),
  ('Java',         'backend',   '/logo/java.svg',       1),
  ('Node.js',      'backend',   '/logo/node.png',       2),
  -- Database
  ('MySQL',        'database',  '/logo/mysql.svg',      0),
  ('PostgreSQL',   'database',  '/logo/postgreSQL.png', 1),
  ('MongoDB',      'database',  '/logo/mongodb.svg',    2),
  -- Tools
  ('Git',          'tools',     '/logo/git.png',        0),
  ('VS Code',      'tools',     '/logo/vscode.png',     1),
  ('Linux',        'tools',     '/logo/linux.png',      2);

-- ── Skills: IT Support (IT_SKILLS) ────────────────────────────────────────────
INSERT INTO skills (name, category, order_index) VALUES
  ('Troubleshooting hardware and software issues (PCs, laptops, printers, etc.)',           'it_support', 0),
  ('Basic networking knowledge (Wi-Fi configuration, setup, troubleshooting, etc.)',        'it_support', 1),
  ('Proficiency in Windows OS, Mac OS, and Linux OS',                                       'it_support', 2),
  ('Experience with Microsoft Office Suite and Google Workspace',                           'it_support', 3),
  ('Excellent verbal and written communication skills for customer support',                 'it_support', 4);

-- ── Certifications ─────────────────────────────────────────────────────────────
INSERT INTO certifications (name, issuer, issue_date, credential_id, url, order_index) VALUES
  ('CompTIA IT Fundamentals+', 'TestOut', '2025-04-01', '6-1C6-VPVCKB',
   'https://certification.testout.com/verifycert/6-1C6-VPVCKB', 0);

-- ── Experiences ────────────────────────────────────────────────────────────────
INSERT INTO experiences (company, role, start_date, end_date, order_index) VALUES
  ('Craze Nails Salon — Lake Mary, FL',              'IT Support Specialist',  '2023-01-01', NULL,         0),
  ('University of Central Florida — Orlando, FL',    'IT Student',             '2022-08-01', NULL,         1),
  ('Sushi Pop — Winter Park, FL',                    'Sushi Chef',             '2017-01-01', '2019-12-31', 2);

-- ── Portfolio Projects ─────────────────────────────────────────────────────────
INSERT INTO portfolio_projects (title, slug, description, long_description, tech_stack, source_code_url, images, featured, year, order_index) VALUES
(
  'Portfolio Website',
  'portfolio',
  'My personal developer portfolio built to showcase my skills, experience, and projects.',
  'My personal developer portfolio built to showcase my skills, experience, and projects.

Key Features:
- Smooth scroll animations powered by GSAP and Lenis
- Fully responsive design across all screen sizes
- Fast performance with Next.js and Tailwind CSS
- Dark themed with custom cursor and particle background',
  ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Lenis'],
  'https://github.com/thangsauce',
  '{"thumbnail":"/projects/thumbnail/portfolio-thumbnail.jpg","long":"/projects/long/portfolio-long.jpg","gallery":["/projects/images/portfolio-1.jpg","/projects/images/portfolio-2.jpg","/projects/images/portfolio-3.jpg"]}',
  true, 2026, 0
),
(
  'CampusLab SIEM',
  'campuslab-siem',
  'A centralized security monitoring system built under hackathon conditions that aggregates logs from multiple sources and flags suspicious activity in real time.',
  'A centralized security monitoring system built under hackathon conditions that aggregates logs from multiple sources and flags suspicious activity in real time. Demonstrates practical application of SIEM concepts in a campus environment.

Built at KnightHacks Hackathon.',
  ARRAY['Python', 'Log Analysis', 'Security Monitoring', 'React'],
  'https://github.com/project-vigil-knighthacks/vigil',
  '{"thumbnail":"/projects/thumbnail/epikcart.jpg","long":"","gallery":["/projects/images/epikcart-1.png","/projects/images/epikcart-2.png"]}',
  true, 2026, 1
),
(
  'Aromamor',
  'aromamor',
  'Modern e-commerce style website for a candle brand demonstrating responsive UI and component-based architecture.',
  'Modern e-commerce style website for a candle brand demonstrating responsive UI and component-based architecture. Built with a focus on clean design, reusable components, and a smooth user experience.',
  ARRAY['React', 'Tailwind CSS', 'Component Architecture', 'E-Commerce'],
  'https://github.com/thangsauce/aromamor-candles',
  '{"thumbnail":"/projects/thumbnail/resume-roaster.jpg","long":"","gallery":["/projects/images/resume-roaster-1.png","/projects/images/resume-roaster-2.png"]}',
  false, 2026, 2
),
(
  'ArenaOps',
  'arenaops',
  'Full-featured platform for organizing esports tournaments — handles bracket generation, match scheduling, and participant tracking.',
  'Full-featured platform for organizing esports tournaments — handles bracket generation, match scheduling, and participant tracking with a clean admin dashboard.',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  'https://github.com/thangsauce/ArenaOps',
  '{"thumbnail":"/projects/thumbnail/property-pro.jpg","long":"","gallery":["/projects/images/property-pro-1.png","/projects/images/property-pro-2.png"]}',
  false, 2026, 3
);
