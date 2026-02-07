# main.go DI リファクタリング

**作業日**: 2026-02-07
**担当**: Claude Code
**ステータス**: 完了

## 目的

main.goの肥大化を防ぎ、DI（依存関係注入）の構成を整理する。
レイヤー別の初期化をモジュール化して保守性を向上させる。

## 作業内容

### 作業開始

- 現在のmain.goの構造を確認
- リファクタリング方針の検討（案A: diパッケージ分離を採用）

### 実装

- `backend/cmd/api/di/container.go`を新規作成
  - `BuildRouterConfig(db, redisClient)` 関数でDI構成を集約
  - Infrastructure → Domain → Usecase → Interface の順に初期化
- `backend/cmd/api/main.go`を簡素化
  - DI部分を`di.BuildRouterConfig()`の1行に置き換え
  - 不要になったimport（service, auth, database, handler, usecase, time）を削除

## 完了サマリー

### 実装内容

- DI構成を`di`パッケージに分離
- main.goのDI部分を約25行から2行に削減
- Clean Architecture準拠を維持

### 変更ファイル一覧

- `backend/cmd/api/di/container.go` - 新規作成（BuildRouterConfig関数）
- `backend/cmd/api/main.go` - DI部分を簡素化

### テスト結果

- go vet: 問題なし
- go build: 成功
- 全テストパス（domain, usecase, interfaces, infrastructure, pkg）

### 次のステップ

- Phase 3: フロントエンド実装
