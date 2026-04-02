CREATE TABLE learning_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'to_learn' CHECK (status IN ('to_learn', 'learning', 'learned')),
  category   TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER learning_items_updated_at
  BEFORE UPDATE ON learning_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read learning"   ON learning_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth insert learning" ON learning_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth update learning" ON learning_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "auth delete learning" ON learning_items FOR DELETE USING (auth.role() = 'authenticated');
