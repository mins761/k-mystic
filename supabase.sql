CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS fortunes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('tarot', 'horoscope')),
  sign TEXT,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'es', 'ja', 'zh-TW')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  card_name TEXT,
  card_number INTEGER CHECK (card_number IS NULL OR card_number BETWEEN 0 AND 21),
  lucky_number INTEGER CHECK (lucky_number IS NULL OR lucky_number BETWEEN 1 AND 9),
  lucky_color TEXT,
  compatibility TEXT,
  affirmation TEXT,
  mantra TEXT,
  best_time TEXT,
  fortune_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fortunes
ADD COLUMN IF NOT EXISTS affirmation TEXT;

ALTER TABLE fortunes
ADD COLUMN IF NOT EXISTS mantra TEXT,
ADD COLUMN IF NOT EXISTS best_time TEXT;

CREATE INDEX IF NOT EXISTS idx_fortunes_date_lang
ON fortunes(fortune_date, lang, type);

CREATE INDEX IF NOT EXISTS idx_fortunes_sign
ON fortunes(sign, lang, fortune_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fortunes_daily_tarot_unique
ON fortunes(lang, fortune_date, type)
WHERE type = 'tarot' AND sign IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fortunes_daily_horoscope_unique
ON fortunes(lang, fortune_date, type, sign)
WHERE type = 'horoscope' AND sign IS NOT NULL;

CREATE TABLE IF NOT EXISTS subscribers_mystic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  lang TEXT DEFAULT 'en' CHECK (lang IN ('en', 'es', 'ja', 'zh-TW')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saju_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  birth_year INTEGER,
  birth_month INTEGER,
  birth_day INTEGER,
  birth_hour TEXT,
  gender TEXT,
  lang TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers_mystic ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read fortunes" ON fortunes;
CREATE POLICY "Public read fortunes"
ON fortunes FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS "Public insert subscribers" ON subscribers_mystic;
CREATE POLICY "Public insert subscribers"
ON subscribers_mystic FOR INSERT TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage saju readings" ON saju_readings;
CREATE POLICY "Service role manage saju readings"
ON saju_readings FOR ALL TO service_role
USING (true)
WITH CHECK (true);
