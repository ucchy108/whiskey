# Git ワークフロー

このドキュメントでは、whiskyプロジェクトのGitワークフローとコミットルールを説明します。

## ブランチ戦略

### 作業開始時

- **必ず新しいブランチを作成**してから作業を開始
- mainブランチから分岐
- ブランチ命名規則:
  - 機能追加: `feature/<task-name>`
  - バグ修正: `fix/<issue-name>`
  - リファクタリング: `refactor/<description>`
  - ドキュメント: `docs/<description>`

### 作業完了時

- コミット時に`Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`を付与
- PRを作成してマージ

## コミットの粒度

**重要: コミットは細かい単位で行う**

```bash
# 悪い例: 全ての変更を一度にコミット
git add .
git commit -m "feat: 複数機能を追加"

# 良い例: 論理的な単位でコミット
git add backend/domain/entity/user.go
git commit -m "feat: User entityを追加"

git add backend/domain/value/email.go
git commit -m "feat: Email値オブジェクトを追加"
```

**コミット単位の基準**:
- 1つのファイルまたは関連する数ファイルを追加/変更
- 1つの機能や修正を表す論理的な単位
- レビュアーが理解しやすい粒度
- コミットメッセージで変更内容を明確に説明できる

**避けるべきコミット**:
- 複数の機能を1つのコミットにまとめる
- 無関係な変更を1つのコミットに含める
- "WIP", "fix", "update"などの曖昧なメッセージ

## 禁止事項

- **mainブランチへの直接コミット禁止**
- **ブランチを切らずに作業を開始しない**
- **push --force to main/master 禁止**
- **git commitに--no-verifyフラグを使用しない**

## 参考リンク

- [Dockerガイド](./docker-guide.md)
- [テスト戦略](./testing-strategy.md)
