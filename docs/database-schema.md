# Database Schema Design

whiskey - ワークアウト管理アプリケーションのデータベース設計

## 概要

このドキュメントでは、Clean Architecture + DDDに基づいたデータベーススキーマ設計を記載します。

### 設計方針

1. **認証とプロフィールの分離**: 認証情報（users）とプロフィール情報（profiles）を分離
2. **運動強度スコアの保存**: GitHub風可視化のために daily_score を計算して保存
3. **推定1RMの事前計算**: 重量成長グラフのために estimated_1rm を計算して保存
4. **正規化**: 種目マスタ（exercises）を分離して、データの一貫性を保つ

## ER図（概念図）

```
users (1) ─── (1) profiles
  │
  └─ (1) ─── (*) workouts
                │
                └─ (1) ─── (*) workout_sets
                              │
exercises (*) ─────────────────┘
```

## テーブル定義

### 1. users（ユーザー認証）

認証に必要な最小限の情報のみを保持。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | ユーザーID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| password_hash | VARCHAR(255) | NOT NULL | パスワードハッシュ（bcrypt） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- `email` (UNIQUE)

**制約:**
- email は有効なメールアドレス形式

---

### 2. profiles（プロフィール）

ユーザーの表示名や属性を保持。usersと1対1。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | プロフィールID |
| user_id | UUID | UNIQUE, NOT NULL, FK(users.id) | ユーザーID |
| display_name | VARCHAR(100) | NOT NULL | 表示名 |
| age | INTEGER | CHECK (age >= 0) | 年齢 |
| weight | DECIMAL(5,2) | CHECK (weight > 0) | 体重（kg） |
| height | DECIMAL(5,2) | CHECK (height > 0) | 身長（cm） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- `user_id` (UNIQUE)

**外部キー:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### 3. exercises（種目マスタ）

運動種目の情報を保持。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | 種目ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 種目名（例: ベンチプレス） |
| description | TEXT | | 種目の説明 |
| body_part | VARCHAR(50) | | 対象部位（例: 胸、脚） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- `name` (UNIQUE)
- `body_part`

**初期データ例:**
```sql
INSERT INTO exercises (id, name, body_part) VALUES
  (uuid_generate_v4(), 'ベンチプレス', '胸'),
  (uuid_generate_v4(), 'スクワット', '脚'),
  (uuid_generate_v4(), 'デッドリフト', '背中');
```

---

### 4. workouts（ワークアウトセッション）

トレーニング実施日と運動強度スコアを保持。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | ワークアウトID |
| user_id | UUID | NOT NULL, FK(users.id) | ユーザーID |
| date | DATE | NOT NULL | 実施日（YYYY-MM-DD） |
| daily_score | INTEGER | NOT NULL, DEFAULT 0 | 運動強度スコア（0-100） |
| memo | TEXT | | メモ |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**
- `user_id, date` (UNIQUE) - 1日1回のワークアウト
- `date` - 日付検索用

**外部キー:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**daily_score の計算方法:**
- 各セットの重量 × 回数 の合計を正規化（0-100）
- GitHub風ヒートマップ表示用

---

### 5. workout_sets（セット詳細）

各セットの重量、回数、推定1RMを保持。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | セットID |
| workout_id | UUID | NOT NULL, FK(workouts.id) | ワークアウトID |
| exercise_id | UUID | NOT NULL, FK(exercises.id) | 種目ID |
| set_number | INTEGER | NOT NULL | セット番号（1,2,3...） |
| reps | INTEGER | NOT NULL, CHECK (reps > 0) | 回数 |
| weight | DECIMAL(6,2) | NOT NULL, CHECK (weight >= 0) | 重量（kg） |
| estimated_1rm | DECIMAL(6,2) | NOT NULL | 推定1RM（kg） |
| duration_seconds | INTEGER | CHECK (duration_seconds >= 0) | 実施時間（秒） |
| notes | TEXT | | メモ |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |

**インデックス:**
- `workout_id` - ワークアウトごとのセット検索
- `exercise_id` - 種目ごとのセット検索
- `workout_id, exercise_id, set_number` (UNIQUE) - 重複防止

**外部キー:**
- `workout_id` REFERENCES `workouts(id)` ON DELETE CASCADE
- `exercise_id` REFERENCES `exercises(id)` ON DELETE RESTRICT

**estimated_1rm の計算方法:**
- Epley式: 1RM = weight × (1 + reps / 30)
- 重量成長グラフ表示用

---

## サンプルデータ

### ユーザー登録とワークアウト記録

```sql
-- ユーザー作成
INSERT INTO users (id, email, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '$2b$10$...');

-- プロフィール作成
INSERT INTO profiles (id, user_id, display_name, age, weight, height) VALUES
  (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Test User', 25, 70.5, 175.0);

-- ワークアウト作成
INSERT INTO workouts (id, user_id, date, daily_score, memo) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '2026-01-24', 75, 'Good workout!');

-- セット記録
INSERT INTO workout_sets (id, workout_id, exercise_id, set_number, reps, weight, estimated_1rm) VALUES
  (uuid_generate_v4(), '660e8400-e29b-41d4-a716-446655440000', (SELECT id FROM exercises WHERE name = 'ベンチプレス'), 1, 10, 60.0, 80.0),
  (uuid_generate_v4(), '660e8400-e29b-41d4-a716-446655440000', (SELECT id FROM exercises WHERE name = 'ベンチプレス'), 2, 8, 65.0, 82.3),
  (uuid_generate_v4(), '660e8400-e29b-41d4-a716-446655440000', (SELECT id FROM exercises WHERE name = 'ベンチプレス'), 3, 6, 70.0, 84.0);
```

## クエリ例

### GitHub風ヒートマップ用データ取得

```sql
-- 過去365日の運動強度スコアを取得
SELECT date, daily_score
FROM workouts
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND date >= CURRENT_DATE - INTERVAL '365 days'
ORDER BY date;
```

### 重量成長グラフ用データ取得

```sql
-- 特定種目の推定1RMの推移を取得
SELECT w.date, MAX(ws.estimated_1rm) as max_1rm
FROM workouts w
JOIN workout_sets ws ON w.id = ws.workout_id
WHERE w.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND ws.exercise_id = (SELECT id FROM exercises WHERE name = 'ベンチプレス')
GROUP BY w.date
ORDER BY w.date;
```

### ワークアウト詳細取得

```sql
-- 特定日のワークアウト詳細
SELECT
  w.date,
  w.daily_score,
  w.memo,
  e.name as exercise_name,
  ws.set_number,
  ws.reps,
  ws.weight,
  ws.estimated_1rm
FROM workouts w
JOIN workout_sets ws ON w.id = ws.workout_id
JOIN exercises e ON ws.exercise_id = e.id
WHERE w.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND w.date = '2026-01-24'
ORDER BY e.name, ws.set_number;
```

## マイグレーション戦略

### ツール

- **golang-migrate**: マイグレーション管理
- **sqlc**: 型安全なクエリ生成

### マイグレーションファイル構成

```
backend/migrations/
├── 000001_create_users_table.up.sql
├── 000001_create_users_table.down.sql
├── 000002_create_profiles_table.up.sql
├── 000002_create_profiles_table.down.sql
├── 000003_create_exercises_table.up.sql
├── 000003_create_exercises_table.down.sql
├── 000004_create_workouts_table.up.sql
├── 000004_create_workouts_table.down.sql
├── 000005_create_workout_sets_table.up.sql
└── 000005_create_workout_sets_table.down.sql
```
