# API仕様書

このドキュメントでは、whiskey バックエンドが提供する全APIエンドポイントの仕様を定義します。

## 共通仕様

### ベースURL

```
http://localhost:8080
```

### 認証方式

セッションベース認証（Redis）を使用。ログイン成功時に `session_id` Cookieが設定される。

認証が必要なエンドポイントには Cookie ヘッダーに `session_id` が必要。未認証の場合は `401 Unauthorized` を返す。

### レスポンス形式

全てのレスポンスは `Content-Type: application/json`。

### エラーレスポンス

```json
{
  "error": "エラーメッセージ"
}
```

### 日時形式

全ての日時フィールドは RFC3339 形式（例: `2026-02-07T00:00:00Z`）。

### ID形式

全てのIDは UUID v4 形式（例: `550e8400-e29b-41d4-a716-446655440000`）。

---

## ヘルスチェック

### `GET /health`

サービスの健全性を確認する。認証不要。

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | サービス正常 |

```json
{"status": "ok"}
```

---

## ユーザー API

### `POST /api/users` - ユーザー登録

認証不要。

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| email | string | Yes | メールアドレス |
| password | string | Yes | パスワード（8文字以上72文字以下） |

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 201 Created | 登録成功 |
| 400 Bad Request | リクエストボディ不正、バリデーションエラー |
| 409 Conflict | メールアドレスが既に登録済み |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

---

### `POST /api/auth/login` - ログイン

認証不要。成功時に `session_id` Cookieを設定。

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| email | string | Yes | メールアドレス |
| password | string | Yes | パスワード |

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | ログイン成功（`Set-Cookie: session_id=...`） |
| 400 Bad Request | リクエストボディ不正 |
| 401 Unauthorized | 認証失敗（メールまたはパスワードが不正） |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

**Cookie設定:**

| 属性 | 値 |
|------|-----|
| Name | `session_id` |
| Path | `/` |
| HttpOnly | `true` |
| Secure | `true` |
| SameSite | `Lax` |
| MaxAge | `86400`（24時間） |

---

### `POST /api/auth/logout` - ログアウト

**認証: 必要**

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 204 No Content | ログアウト成功（Cookieを削除） |
| 401 Unauthorized | セッションが見つからない |
| 500 Internal Server Error | サーバーエラー |

---

### `GET /api/users/{id}` - ユーザー情報取得

**認証: 必要**

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ユーザーID |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 取得成功 |
| 400 Bad Request | IDの形式が不正 |
| 404 Not Found | ユーザーが見つからない |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

---

### `PUT /api/users/{id}/password` - パスワード変更

**認証: 必要**

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ユーザーID |

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| current_password | string | Yes | 現在のパスワード |
| new_password | string | Yes | 新しいパスワード（8文字以上72文字以下） |

```json
{
  "current_password": "currentpassword",
  "new_password": "newpassword123"
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 204 No Content | 変更成功 |
| 400 Bad Request | リクエストボディ不正、バリデーションエラー |
| 401 Unauthorized | 現在のパスワードが不正 |
| 404 Not Found | ユーザーが見つからない |
| 500 Internal Server Error | サーバーエラー |

---

## ワークアウト API

全エンドポイント **認証: 必要**。ユーザーは自身のワークアウトのみ操作可能。

### `POST /api/workouts` - ワークアウト記録

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| date | string (RFC3339) | Yes | ワークアウト日 |
| memo | string \| null | No | メモ |
| sets | SetInput[] | Yes | セット一覧（1つ以上必須） |

**SetInput:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| exercise_id | UUID | Yes | エクササイズID |
| set_number | int | Yes | セット番号（1以上） |
| reps | int | Yes | レップ数（1以上） |
| weight | float | Yes | 重量 kg（0以上） |
| duration_seconds | int \| null | No | 持続時間（秒） |
| notes | string \| null | No | セットメモ |

```json
{
  "date": "2026-02-07T00:00:00Z",
  "memo": "Chest day",
  "sets": [
    {
      "exercise_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "set_number": 1,
      "reps": 10,
      "weight": 60.0
    },
    {
      "exercise_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "set_number": 2,
      "reps": 8,
      "weight": 65.0,
      "notes": "Good form"
    }
  ]
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 201 Created | 記録成功 |
| 400 Bad Request | リクエスト不正、バリデーションエラー、セットが空 |
| 404 Not Found | エクササイズが見つからない |
| 409 Conflict | 同日に既にワークアウトが存在 |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "workout": {
    "id": "...",
    "user_id": "...",
    "date": "2026-02-07T00:00:00Z",
    "daily_score": 0,
    "memo": "Chest day",
    "created_at": "2026-02-07T12:00:00Z",
    "updated_at": "2026-02-07T12:00:00Z"
  },
  "sets": [
    {
      "id": "...",
      "workout_id": "...",
      "exercise_id": "...",
      "set_number": 1,
      "reps": 10,
      "weight": 60.0,
      "estimated_1rm": 80.0,
      "duration_seconds": null,
      "notes": null,
      "created_at": "2026-02-07T12:00:00Z"
    }
  ]
}
```

---

### `GET /api/workouts` - ワークアウト一覧取得

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| start_date | string (RFC3339) | No | 開始日フィルタ |
| end_date | string (RFC3339) | No | 終了日フィルタ |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 取得成功 |
| 400 Bad Request | クエリパラメータ不正 |
| 500 Internal Server Error | サーバーエラー |

```json
[
  {
    "id": "...",
    "user_id": "...",
    "date": "2026-02-07T00:00:00Z",
    "daily_score": 0,
    "memo": "Chest day",
    "created_at": "2026-02-07T12:00:00Z",
    "updated_at": "2026-02-07T12:00:00Z"
  }
]
```

---

### `GET /api/workouts/{id}` - ワークアウト詳細取得

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ワークアウトID |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 取得成功 |
| 400 Bad Request | IDの形式が不正 |
| 403 Forbidden | アクセス権がない（他ユーザーのワークアウト） |
| 404 Not Found | ワークアウトが見つからない |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "workout": {
    "id": "...",
    "user_id": "...",
    "date": "2026-02-07T00:00:00Z",
    "daily_score": 0,
    "memo": "Chest day",
    "created_at": "2026-02-07T12:00:00Z",
    "updated_at": "2026-02-07T12:00:00Z"
  },
  "sets": [
    {
      "id": "...",
      "workout_id": "...",
      "exercise_id": "...",
      "set_number": 1,
      "reps": 10,
      "weight": 60.0,
      "estimated_1rm": 80.0,
      "duration_seconds": null,
      "notes": null,
      "created_at": "2026-02-07T12:00:00Z"
    }
  ]
}
```

---

### `PUT /api/workouts/{id}/memo` - メモ更新

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ワークアウトID |

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| memo | string \| null | Yes | メモ（nullで削除） |

```json
{
  "memo": "Updated memo"
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 更新成功 |
| 400 Bad Request | リクエスト不正 |
| 403 Forbidden | アクセス権がない |
| 404 Not Found | ワークアウトが見つからない |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "...",
  "user_id": "...",
  "date": "2026-02-07T00:00:00Z",
  "daily_score": 0,
  "memo": "Updated memo",
  "created_at": "2026-02-07T12:00:00Z",
  "updated_at": "2026-02-07T12:30:00Z"
}
```

---

### `POST /api/workouts/{id}/sets` - セット追加

既存のワークアウトにセットを追加する。

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ワークアウトID |

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| sets | SetInput[] | Yes | 追加するセット一覧 |

```json
{
  "sets": [
    {
      "exercise_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "set_number": 3,
      "reps": 6,
      "weight": 70.0
    }
  ]
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 201 Created | 追加成功 |
| 400 Bad Request | リクエスト不正 |
| 403 Forbidden | アクセス権がない |
| 404 Not Found | ワークアウトまたはエクササイズが見つからない |
| 500 Internal Server Error | サーバーエラー |

```json
[
  {
    "id": "...",
    "workout_id": "...",
    "exercise_id": "...",
    "set_number": 3,
    "reps": 6,
    "weight": 70.0,
    "estimated_1rm": 83.3,
    "duration_seconds": null,
    "notes": null,
    "created_at": "2026-02-07T12:30:00Z"
  }
]
```

---

### `DELETE /api/workouts/{id}` - ワークアウト削除

関連する全セットもカスケード削除される。

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ワークアウトID |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 204 No Content | 削除成功 |
| 400 Bad Request | IDの形式が不正 |
| 403 Forbidden | アクセス権がない |
| 404 Not Found | ワークアウトが見つからない |
| 500 Internal Server Error | サーバーエラー |

---

### `DELETE /api/workout-sets/{id}` - セット削除

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | ワークアウトセットID |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 204 No Content | 削除成功 |
| 400 Bad Request | IDの形式が不正 |
| 403 Forbidden | アクセス権がない |
| 404 Not Found | ワークアウトセットが見つからない |
| 500 Internal Server Error | サーバーエラー |

---

### `GET /api/workouts/contributions` - コントリビューションデータ取得

GitHub風ヒートマップ表示用のデータを取得する。

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| start_date | string (RFC3339) | Yes | 開始日 |
| end_date | string (RFC3339) | Yes | 終了日 |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 取得成功 |
| 400 Bad Request | クエリパラメータ不正または未指定 |
| 500 Internal Server Error | サーバーエラー |

```json
[
  {
    "date": "2026-02-01T00:00:00Z",
    "daily_score": 3
  },
  {
    "date": "2026-02-03T00:00:00Z",
    "daily_score": 5
  }
]
```

---

## エクササイズ API

全エンドポイント **認証: 必要**。

### `POST /api/exercises` - エクササイズ作成

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| name | string | Yes | エクササイズ名（ユニーク） |
| description | string \| null | No | 説明 |
| body_part | string \| null | No | 身体部位 |

```json
{
  "name": "Bench Press",
  "description": "Chest exercise using barbell",
  "body_part": "chest"
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 201 Created | 作成成功 |
| 400 Bad Request | リクエスト不正、バリデーションエラー |
| 409 Conflict | エクササイズ名が既に存在 |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "...",
  "name": "Bench Press",
  "description": "Chest exercise using barbell",
  "body_part": "chest",
  "created_at": "2026-02-07T12:00:00Z",
  "updated_at": "2026-02-07T12:00:00Z"
}
```

---

### `GET /api/exercises` - エクササイズ一覧取得

**クエリパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| body_part | string | No | 身体部位でフィルタリング |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 取得成功 |
| 400 Bad Request | クエリパラメータ不正 |
| 500 Internal Server Error | サーバーエラー |

```json
[
  {
    "id": "...",
    "name": "Bench Press",
    "description": "Chest exercise using barbell",
    "body_part": "chest",
    "created_at": "2026-02-07T12:00:00Z",
    "updated_at": "2026-02-07T12:00:00Z"
  }
]
```

---

### `GET /api/exercises/{id}` - エクササイズ詳細取得

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | エクササイズID |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 取得成功 |
| 400 Bad Request | IDの形式が不正 |
| 404 Not Found | エクササイズが見つからない |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "...",
  "name": "Bench Press",
  "description": "Chest exercise using barbell",
  "body_part": "chest",
  "created_at": "2026-02-07T12:00:00Z",
  "updated_at": "2026-02-07T12:00:00Z"
}
```

---

### `PUT /api/exercises/{id}` - エクササイズ更新

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | エクササイズID |

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| name | string \| null | No | 新しいエクササイズ名 |
| description | string \| null | No | 新しい説明 |
| body_part | string \| null | No | 新しい身体部位 |

```json
{
  "name": "Incline Bench Press",
  "description": "Upper chest exercise",
  "body_part": "chest"
}
```

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 200 OK | 更新成功 |
| 400 Bad Request | リクエスト不正、バリデーションエラー |
| 404 Not Found | エクササイズが見つからない |
| 409 Conflict | エクササイズ名が既に存在 |
| 500 Internal Server Error | サーバーエラー |

```json
{
  "id": "...",
  "name": "Incline Bench Press",
  "description": "Upper chest exercise",
  "body_part": "chest",
  "created_at": "2026-02-07T12:00:00Z",
  "updated_at": "2026-02-07T12:30:00Z"
}
```

---

### `DELETE /api/exercises/{id}` - エクササイズ削除

**パスパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|------|
| id | UUID | エクササイズID |

**レスポンス:**

| ステータス | 説明 |
|-----------|------|
| 204 No Content | 削除成功 |
| 400 Bad Request | IDの形式が不正 |
| 404 Not Found | エクササイズが見つからない |
| 500 Internal Server Error | サーバーエラー |

---

## エンドポイント一覧

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/health` | 不要 | ヘルスチェック |
| POST | `/api/users` | 不要 | ユーザー登録 |
| POST | `/api/auth/login` | 不要 | ログイン |
| POST | `/api/auth/logout` | 必要 | ログアウト |
| GET | `/api/users/{id}` | 必要 | ユーザー情報取得 |
| PUT | `/api/users/{id}/password` | 必要 | パスワード変更 |
| POST | `/api/workouts` | 必要 | ワークアウト記録 |
| GET | `/api/workouts` | 必要 | ワークアウト一覧取得 |
| GET | `/api/workouts/contributions` | 必要 | コントリビューションデータ取得 |
| GET | `/api/workouts/{id}` | 必要 | ワークアウト詳細取得 |
| PUT | `/api/workouts/{id}/memo` | 必要 | メモ更新 |
| POST | `/api/workouts/{id}/sets` | 必要 | セット追加 |
| DELETE | `/api/workouts/{id}` | 必要 | ワークアウト削除 |
| DELETE | `/api/workout-sets/{id}` | 必要 | セット削除 |
| POST | `/api/exercises` | 必要 | エクササイズ作成 |
| GET | `/api/exercises` | 必要 | エクササイズ一覧取得 |
| GET | `/api/exercises/{id}` | 必要 | エクササイズ詳細取得 |
| PUT | `/api/exercises/{id}` | 必要 | エクササイズ更新 |
| DELETE | `/api/exercises/{id}` | 必要 | エクササイズ削除 |

## 参考リンク

- [Clean Architecture](../architecture/clean-architecture.md)
- [データベースガイド](./database-guide.md)
- [テスト戦略](./testing-strategy.md)
