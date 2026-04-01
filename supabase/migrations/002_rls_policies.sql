-- Enable RLS on all tables
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read portfolio data)
CREATE POLICY "public_read_projects"       ON portfolio_projects FOR SELECT USING (true);
CREATE POLICY "public_read_skills"         ON skills             FOR SELECT USING (true);
CREATE POLICY "public_read_certifications" ON certifications     FOR SELECT USING (true);
CREATE POLICY "public_read_experiences"    ON experiences        FOR SELECT USING (true);

-- Authenticated write access
-- (Worker uses service role which bypasses RLS — these protect direct PostgREST access)
CREATE POLICY "auth_write_projects"       ON portfolio_projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth_write_skills"         ON skills             FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth_write_certifications" ON certifications     FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth_write_experiences"    ON experiences        FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
