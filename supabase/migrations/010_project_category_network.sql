-- Migrate project category key from `it_systems` to `network`

UPDATE public.portfolio_projects
SET category = 'network'
WHERE category = 'it_systems';

ALTER TABLE public.portfolio_projects
DROP CONSTRAINT IF EXISTS portfolio_projects_category_check;

ALTER TABLE public.portfolio_projects
ADD CONSTRAINT portfolio_projects_category_check
CHECK (category IN ('web_development', 'cybersecurity', 'network'));
