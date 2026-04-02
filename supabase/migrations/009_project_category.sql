-- Add explicit project category so homepage sections are manually controlled.
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'web_development';

-- Keep values constrained to known homepage buckets.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'portfolio_projects_category_check'
  ) THEN
    ALTER TABLE portfolio_projects
      ADD CONSTRAINT portfolio_projects_category_check
      CHECK (category IN ('web_development', 'cybersecurity', 'it_systems'));
  END IF;
END
$$;

