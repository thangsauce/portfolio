CREATE TABLE project_docs (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT        NOT NULL,
  content              TEXT        NOT NULL DEFAULT '',
  portfolio_project_id UUID        REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER project_docs_updated_at
  BEFORE UPDATE ON project_docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE project_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read project_docs"   ON project_docs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth insert project_docs" ON project_docs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth update project_docs" ON project_docs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth delete project_docs" ON project_docs FOR DELETE USING (auth.role() = 'authenticated');
