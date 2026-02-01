# Goテスト実行・生成用Skills作成

**作業日**: 2026-01-24
**担当**: Claude Code
**ステータス**: 完了

## 目的

Go言語のバックエンドプロジェクト用に、テスト実行とテストファイル自動生成のSkillsを作成する。

## 作業内容

### 10:14 - 作業開始

- ユーザーからテスト実行・生成用のSkills作成依頼を受ける
- 既存のSkills構造を確認（storybook-generator, theme-color-validator, work-log）

### 10:15 - Skills設計

2つのSkillsを設計：

1. **go-test-runner**: テスト実行 + カバレッジレポート
2. **go-test-generator**: Clean Architectureに準拠したテストファイル生成

### 10:20 - go-test-runner Skill作成

- Dockerコンテナ内でGoテストを実行
- カバレッジレポート生成機能
- レイヤー別テスト実行サポート
- テスト失敗時のエラー詳細表示

**主な機能:**
- 全テスト実行: `docker compose exec backend go test -v ./...`
- レイヤー別実行: Domain/Usecase/Infrastructure/Interfaces
- カバレッジHTML生成: `go tool cover -html`
- テスト結果の整形された報告

### 10:45 - go-test-generator Skill作成

- Clean Architectureの各レイヤーに適したテストテンプレート
- レイヤー別のモック使用方針
- テーブルドリブンテスト生成（Domain層）
- testifyを使用したモック生成（Usecase/Interfaces層）

**レイヤー別テンプレート:**
- **Domain層**: テーブルドリブンテスト、モックなし
- **Usecase層**: Repositoryモック、testify使用
- **Infrastructure層**: 実DB使用、統合テスト
- **Interfaces層**: Usecaseモック、httptest使用

### 11:03 - 完了

- 2つのSkillsを作成完了
- 作業ログを記録

## 完了サマリー

### 実装内容

1. **go-test-runner Skill**
   - Dockerコンテナ内でのテスト実行
   - カバレッジレポート生成
   - レイヤー別テスト実行
   - 失敗時のエラー分析

2. **go-test-generator Skill**
   - Clean Architecture準拠のテストファイル生成
   - レイヤー別のテストテンプレート
   - モックの適切な使用（レイヤー別）
   - テーブルドリブンテスト生成

### 作成ファイル一覧

- `.claude/skills/go-test-runner/skill.md` - テスト実行Skill
- `.claude/skills/go-test-generator/skill.md` - テスト生成Skill

### Skills の特徴

#### go-test-runner

**実行タイミング:**
- ユーザーが「テストを実行して」と依頼
- ユーザーが「カバレッジを確認して」と依頼
- コード変更後にテスト実行を提案（自動実行はしない）

**主なコマンド:**
```bash
# 全テスト実行
docker compose exec backend go test -v ./...

# カバレッジ付き実行
docker compose exec backend go test -v -coverprofile=coverage.out ./...

# レイヤー別実行
docker compose exec backend go test -v ./domain/...
```

**出力フォーマット:**
- テスト成功/失敗の数
- カバレッジパーセンテージ（レイヤー別）
- 失敗したテストの詳細
- 推奨アクション

#### go-test-generator

**実行タイミング:**
- ユーザーが「テストファイルを生成して」と依頼
- 新規ファイル作成後にテスト生成を提案（自動生成はしない）

**生成テンプレート:**

1. **Domain Layer**
   - テーブルドリブンテスト
   - モックなし
   - ビジネスルールのテスト

2. **Usecase Layer**
   - Repositoryをモック（testify）
   - ビジネスロジックのテスト
   - Arrange-Act-Assertパターン

3. **Infrastructure Layer**
   - 実DB使用
   - 統合テスト
   - テストデータのセットアップ/クリーンアップ

4. **Interfaces Layer**
   - Usecaseをモック（testify）
   - HTTPハンドラーのテスト
   - httptestパッケージ使用

### 次のステップ

- [ ] testify パッケージをbackend/go.modに追加
- [ ] テストDB（whiskey_test）のセットアップ
- [ ] Makefileでテストコマンドのショートカット作成（任意）
- [ ] 実際のテストファイル生成を試す

## 備考

- 両SkillsともCLAUDE.mdのテスト戦略と整合性を保つ
- CLAUDE.md: 「どう考えるか」（戦略）
- Skills: 「何をするか」（実行）
- testifyパッケージは次回の実装時に追加予定

## 追記: フォーマット修正（18:54）

- ユーザーからSkillsのフォーマットが正しいか指摘を受ける
- 既存のSkills（work-log, storybook-generator）と比較
- **問題点**: YAML frontmatter が抜けており、不要な Base directory 行が入っていた

### 修正内容

**修正前:**
```markdown
Base directory for this skill: /path/to/skill

# Skill Name
```

**修正後:**
```markdown
---
name: skill-name
description: スキルの説明
---

# Skill Name
```

- go-test-runner と go-test-generator の両方を修正
- Claude Codeに正しく認識されることを確認
