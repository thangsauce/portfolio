-- Portfolio projects
CREATE TABLE portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  long_description text,
  tech_stack text[] DEFAULT '{}',
  source_code_url text,
  images jsonb DEFAULT '{"thumbnail":"","long":"","gallery":[]}',
  featured boolean DEFAULT false,
  year int,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Skills (IT skills list)
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text, -- legacy column; not required after migration 003
  icon_url text,
  order_index int DEFAULT 0
);

-- Certifications
CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text,
  issue_date date,
  credential_id text,
  url text,
  order_index int DEFAULT 0
);

-- Work experiences
CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  start_date date,
  end_date date,         -- NULL means current/present
  description text[] DEFAULT '{}',
  order_index int DEFAULT 0
);
