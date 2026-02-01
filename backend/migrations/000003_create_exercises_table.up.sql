-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    body_part VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_body_part ON exercises(body_part);

-- Insert initial exercise data
INSERT INTO exercises (name, body_part, description) VALUES
    ('ベンチプレス', '胸', '胸を鍛える基本種目'),
    ('スクワット', '脚', '下半身を鍛える基本種目'),
    ('デッドリフト', '背中', '背中と下半身を鍛える基本種目'),
    ('ショルダープレス', '肩', '肩を鍛える基本種目'),
    ('バーベルロウ', '背中', '背中を鍛える基本種目'),
    ('ラットプルダウン', '背中', '背中の広がりを作る種目'),
    ('バイセップカール', '腕', '上腕二頭筋を鍛える種目'),
    ('トライセップエクステンション', '腕', '上腕三頭筋を鍛える種目')
ON CONFLICT (name) DO NOTHING;
