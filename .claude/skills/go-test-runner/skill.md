---
name: go-test-runner
description: GoバックエンドのテストをDockerコンテナ内で実行し、カバレッジレポートを生成するSkillです。作業開始時、重要な変更時、作業完了時に自動的に使用されます。
---

# Go Test Runner

GoバックエンドのテストをDockerコンテナ内で実行し、カバレッジレポートを生成するSkillです。

## 目的

- Goのテストを自動実行
- カバレッジレポートの生成と表示
- テスト失敗時のエラー詳細表示
- レイヤー別のテスト実行

## Instructions

### 1. テスト実行前の確認

1. Dockerコンテナが起動しているか確認
2. 起動していない場合は `docker compose up -d` で起動

```bash
# コンテナの状態を確認
docker compose ps

# backendコンテナが起動していない場合
docker compose up -d backend
```

### 2. テスト実行パターン

#### 全テストを実行

```bash
# 全テストを実行（verbose）
docker compose exec backend go test -v ./...

# カバレッジ付きで実行
docker compose exec backend go test -v -coverprofile=coverage.out ./...

# カバレッジをHTML形式で出力
docker compose exec backend sh -c "go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html"
```

#### レイヤー別にテスト実行

```bash
# Domain層のテスト
docker compose exec backend go test -v ./domain/...

# Usecase層のテスト
docker compose exec backend go test -v ./usecase/...

# Infrastructure層のテスト
docker compose exec backend go test -v ./infrastructure/...

# Interfaces層のテスト
docker compose exec backend go test -v ./interfaces/...
```

#### 特定のパッケージをテスト

```bash
# 特定のパッケージ
docker compose exec backend go test -v ./domain/entity

# 特定のテストファイル
docker compose exec backend go test -v ./domain/entity/user_test.go
```

### 3. カバレッジレポートの確認

1. カバレッジファイル生成

```bash
docker compose exec backend go test -coverprofile=coverage.out ./...
```

2. カバレッジサマリー表示

```bash
docker compose exec backend go tool cover -func=coverage.out
```

3. HTML形式でカバレッジレポート生成

```bash
# コンテナ内で生成
docker compose exec backend go tool cover -html=coverage.out -o coverage.html

# ホストにコピー
docker compose cp backend:/app/coverage.html ./backend/coverage.html

# ブラウザで開く
open backend/coverage.html
```

### 4. テスト失敗時の対応

テストが失敗した場合：

1. エラーメッセージを確認
2. 該当するテストファイルを読み込み
3. 失敗原因を特定
4. コードを修正
5. 再度テストを実行

### 5. 出力の読み方

**成功時:**
```
=== RUN   TestUserEntity_Validate
--- PASS: TestUserEntity_Validate (0.00s)
PASS
ok      github.com/ucchy108/whiskey/backend/domain/entity       0.002s
```

**失敗時:**
```
=== RUN   TestUserEntity_Validate
    user_test.go:15: Expected error, but got nil
--- FAIL: TestUserEntity_Validate (0.00s)
FAIL
FAIL    github.com/ucchy108/whiskey/backend/domain/entity       0.002s
```

**カバレッジ:**
```
github.com/ucchy108/whiskey/backend/domain/entity/user.go:10:   Validate        100.0%
github.com/ucchy108/whiskey/backend/domain/entity/user.go:20:   IsValid         80.0%
total:                                                          (statements)    90.0%
```

## 自動起動の条件

以下の場合に自動的にこのSkillを使用します：

1. ユーザーが「テストを実行して」と依頼した時
2. ユーザーが「カバレッジを確認して」と依頼した時
3. コードを変更した後、テスト実行が必要な時（ユーザーに提案）
4. ユーザーが明示的に `/go-test-runner` を実行した時

## IMPORTANT: 自動実行ポリシー

このSkillは以下の条件を満たした際、ユーザーの確認後に実行してください：

### 実行タイミング

1. **コード変更後（提案）**
   - ✅ Domain/Usecase/Infrastructure/Interfacesのコードを変更した時
   - ✅ ユーザーに「テストを実行しますか？」と提案
   - ❌ 自動実行はしない（ユーザーの明示的な指示を待つ）

2. **ユーザーの明示的な指示**
   - ✅ 「テストを実行して」
   - ✅ 「カバレッジを確認して」
   - ✅ 「/go-test-runner」

### 実行手順

1. Dockerコンテナの状態を確認
2. 適切なテストコマンドを選択（全テスト or レイヤー別）
3. テストを実行
4. 結果をユーザーに報告
5. 失敗がある場合は原因を分析

## 使用するツール

- **Bash**: Dockerコマンド実行
- **Read**: テストファイルの読み込み（失敗時）
- **TaskCreate/TaskUpdate**: テスト実行タスクの管理

## 出力フォーマット

テスト実行後、以下の情報をユーザーに報告してください：

```markdown
## テスト実行結果

**実行コマンド:** `docker compose exec backend go test -v ./...`

**結果:**
- ✅ 全テスト成功: 15 passed
- ❌ 失敗: 2 failed
- ⏭️  スキップ: 1 skipped

**カバレッジ:**
- Domain層: 95.0%
- Usecase層: 85.0%
- Infrastructure層: 70.0%
- 全体: 83.3%

**失敗したテスト:**
1. `TestUserEntity_Validate` - domain/entity/user_test.go:15
   - エラー: Expected error, but got nil

**推奨アクション:**
- [ ] 失敗したテストを修正
- [ ] Infrastructureのカバレッジを向上
```

## 注意事項

- **Dockerコンテナ内で実行**: ホストで直接 `go test` を実行しない
- **データベース必要な場合**: PostgreSQLコンテナが起動していることを確認
- **テストデータ**: テスト後のクリーンアップを確認
- **タイムアウト**: 長時間かかるテストは `-timeout` オプションを追加

## Examples

### Example 1: 全テスト実行

```markdown
user: テストを実行して
assistant: Dockerコンテナ内で全テストを実行します。

[Bash: docker compose exec backend go test -v ./...]

## テスト実行結果

**結果:**
- ✅ 全テスト成功: 15 passed

**カバレッジ:**
- 全体: 85.2%

全てのテストが成功しました！
```

### Example 2: レイヤー別テスト実行

```markdown
user: Domain層のテストだけ実行して
assistant: Domain層のテストを実行します。

[Bash: docker compose exec backend go test -v ./domain/...]

## テスト実行結果

**結果:**
- ✅ 全テスト成功: 5 passed

**カバレッジ:**
- Domain層: 95.0%

Domain層のテストは全て成功しました！
```

### Example 3: カバレッジレポート生成

```markdown
user: カバレッジレポートを確認したい
assistant: カバレッジレポートを生成します。

[Bash: docker compose exec backend go test -coverprofile=coverage.out ./...]
[Bash: docker compose exec backend go tool cover -func=coverage.out]

## カバレッジレポート

**レイヤー別カバレッジ:**
- Domain層: 95.0%
- Usecase層: 85.0%
- Infrastructure層: 70.0%
- Interfaces層: 80.0%

**全体カバレッジ:** 82.5%

**低カバレッジのファイル:**
- infrastructure/database/user_repository.go: 65.0%
- usecase/workout_usecase.go: 75.0%

HTML形式のレポートも生成しました: `backend/coverage.html`
```

## Related Files

このSkillを効果的に使用するための関連ファイル：

- `backend/Makefile` - テストコマンドのショートカット（作成予定）
- `backend/coverage.html` - カバレッジレポート（生成ファイル）
- `backend/coverage.out` - カバレッジデータ（生成ファイル）
