ALTER TABLE public.portfolio_projects
ADD COLUMN IF NOT EXISTS live_url text;
