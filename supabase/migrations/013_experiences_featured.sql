ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

UPDATE experiences
SET featured = false
WHERE featured IS NULL;
