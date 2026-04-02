CREATE TABLE todos (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority   TEXT        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read todos"   ON todos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth insert todos" ON todos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth update todos" ON todos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth delete todos" ON todos FOR DELETE USING (auth.role() = 'authenticated');
