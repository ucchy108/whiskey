---
name: commit
description: 変更内容を分析し、論理的な単位でコミットを作成するSkillです。コミットメッセージはConventional Commitsに従い、日本語で記述します。
---

# Commit

変更内容を分析し、論理的な単位でコミットを作成するSkillです。

## 目的

- 変更内容に応じた適切なコミット単位の判断
- Conventional Commits 準拠のメッセージ生成
- 関連しない変更の混在を防止
- コミット履歴の品質維持

## Instructions

### 1. 変更内容の把握

以下のコマンドを並列で実行し、現在の変更を把握する。

```bash
# 並列実行
git status                          # 変更ファイル一覧
git diff --stat HEAD                # 変更量の概要
git diff HEAD                       # 詳細な差分
git ls-files --others --exclude-standard  # 未追跡ファイル
git log --oneline -5                # 直近のコミットスタイル確認
```

### 2. コミット単位の判断

変更内容を分析し、**論理的に独立した単位**に分割する。

#### 分割の基準

| 基準 | 分割する | 1つにまとめる |
|---|---|---|
| 機能 | 異なる機能の変更 | 同じ機能に関する変更 |
| 目的 | feat + chore が混在 | すべて同じ目的 |
| Issue | 異なる Issue に紐づく | 同じ Issue に紐づく |
| スキル/設定 | コードとスキルの変更 | コードのみ |

#### 分割の例

```
# 分割すべきケース
feat: ヒートマップ実装 (#27)     ← 機能コード
chore: スキル追加・削除           ← プロジェクト設定

# まとめてよいケース
feat: ヒートマップ実装 (#27)     ← コンポーネント + フック + テスト + Storybook
```

### 3. ステージングとコミット

#### 除外すべきファイル

以下のファイルはコミットに含めない:

- `.env`, `credentials.json` 等の機密ファイル
- 作業に無関係な変更（他の作業で発生した差分）
- `docs/work-logs/` のログファイル（削除済みスキルの残留物）

#### ステージング

```bash
# ✅ 正しい: 関連ファイルを明示的に指定
git add frontend/src/features/dashboard/ frontend/src/shared/theme/theme.ts

# ❌ 間違い: 全ファイルを一括追加
git add -A
git add .
```

#### コミットメッセージ

**Conventional Commits** 形式で日本語で記述する。

```
<type>: <概要>

<本文（任意、変更の詳細）>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**type の種類:**

| type | 用途 | 例 |
|---|---|---|
| `feat` | 新機能の追加 | `feat: ヒートマップコンポーネントを実装` |
| `fix` | バグ修正 | `fix: タイムゾーンによる日付ずれを修正` |
| `refactor` | リファクタリング | `refactor: WorkoutFormのロジックをフックに分離` |
| `test` | テストの追加・修正 | `test: DashboardPageのMSWテストを追加` |
| `docs` | ドキュメントの変更 | `docs: API仕様書を更新` |
| `chore` | 設定・ツール・スキル | `chore: code-reviewerスキルを追加` |
| `style` | フォーマット変更 | `style: import順序を修正` |

**Issue 紐づけ:**

- Issue に関連する場合、概要の末尾に `(#番号)` を付与
- 例: `feat: GitHub風ワークアウトヒートマップを実装 (#27)`

**本文の書き方:**

- 1行目（概要）: 何をしたかを簡潔に（50文字以内目安）
- 空行
- 本文: なぜ・何を変更したかの詳細（箇条書き推奨）
- 空行
- Co-Authored-By トレーラー

```
feat: GitHub風ワークアウトヒートマップを実装 (#27)

DashboardPageにGitHub風のヒートマップを統合し、日別の運動強度を可視化。

- HeatmapCell/HeatmapLegend/WorkoutHeatmapコンポーネント
- useContributions/useHeatmapGridカスタムフック
- タイムゾーン安全なローカル日付キー生成
- MSWベースのテスト（8件全通過）

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

#### コミット実行

HEREDOC を使ってメッセージを渡す:

```bash
git commit -m "$(cat <<'EOF'
feat: 概要

- 詳細1
- 詳細2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### 4. コミット後の確認

```bash
git status    # ステージに残りがないか確認
git log -1    # コミット内容の確認
```

残りの変更がある場合、Step 2 に戻って次のコミット単位を判断する。

## 禁止事項

- `git add -A` や `git add .` による一括ステージング禁止
- `--no-verify` フラグ禁止
- `--amend` は明示的に指示された場合のみ
- 機密ファイル（`.env` 等）のコミット禁止
- 空コミットの作成禁止
- `push --force to main` 禁止

## 使用するツール

- **Bash**: git コマンドの実行

## 注意事項

- **Co-Authored-By を必ず付与**: すべてのコミットに `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` を含める
- **diff を必ず確認**: ステージング前に `git diff` で変更内容を確認する
- **無関係な変更を混ぜない**: 作業に関係ない差分はコミットに含めない
- **直近のコミットスタイルを参考に**: `git log --oneline -5` でリポジトリのスタイルに合わせる

## Examples

### Example 1: 単一機能のコミット

```
user: コミットして
assistant: [git status, git diff --stat, git log で確認]
assistant: 変更内容を確認しました。ヒートマップ関連の27ファイルを1コミットにまとめます。
assistant: [git add で関連ファイルをステージ]
assistant: [git commit]
assistant: コミットしました: `feat: GitHub風ワークアウトヒートマップを実装 (#27)`
```

### Example 2: 複数の論理単位に分割

```
user: コミットして
assistant: [git status, git diff --stat, git log で確認]
assistant: 2つの独立した変更があるため、コミットを分割します:
  1. feat: ヒートマップ実装 (#27) — 機能コード
  2. chore: スキル追加・削除 — プロジェクト設定
assistant: [1つ目をステージ → コミット]
assistant: [2つ目をステージ → コミット]
assistant: 2件のコミットを作成しました。
```

### Example 3: 無関係な変更がある場合

```
user: コミットして
assistant: [git status, git diff で確認]
assistant: `compose.yml` に今回の作業と無関係な変更があります。
         これはコミットに含めず除外します。
assistant: [関連ファイルのみステージ → コミット]
```
