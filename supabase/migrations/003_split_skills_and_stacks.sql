-- Split "skills" and "stacks" into separate datasets.
-- skills: IT skills list
-- stacks: frontend/backend/database/tools items shown in "My Stack"

CREATE TABLE stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text, -- 'frontend' | 'backend' | 'database' | 'tools'
  icon_url text,
  order_index int DEFAULT 0
);

-- Move existing stack-like rows from skills -> stacks.
INSERT INTO stacks (name, category, icon_url, order_index)
SELECT
  name,
  CASE
    WHEN lower(replace(coalesce(category, ''), '-', '_')) IN ('front_end', 'frontend_dev', 'web') THEN 'frontend'
    WHEN lower(replace(coalesce(category, ''), '-', '_')) IN ('back_end', 'backend_dev') THEN 'backend'
    ELSE lower(replace(coalesce(category, ''), '-', '_'))
  END AS normalized_category,
  icon_url,
  order_index
FROM skills
WHERE lower(replace(coalesce(category, ''), '-', '_')) IN (
  'frontend', 'front_end', 'frontend_dev', 'web',
  'backend', 'back_end', 'backend_dev',
  'database', 'tools'
);

-- Keep only IT skills in the skills table.
DELETE FROM skills
WHERE lower(replace(coalesce(category, ''), '-', '_')) IN (
  'frontend', 'front_end', 'frontend_dev', 'web',
  'backend', 'back_end', 'backend_dev',
  'database', 'tools'
);

ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_stacks" ON stacks FOR SELECT USING (true);

CREATE POLICY "auth_write_stacks" ON stacks FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
