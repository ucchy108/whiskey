# テスト失敗原因の調査

**作業日**: 2025-12-31
**担当**: Claude Code
**ステータス**: 完了

## 目的

テスト用DB分離の実装後、全テストを実行したところ失敗する箇所があったため、原因を調査して修正する。

## 作業内容

### 22:00 - 作業開始・初回テスト実行

- テスト用DB分離の実装完了後のテスト実行
- **結果**: 46/116テストが失敗
- エラーパターンの分析:
  - authRepository: データが保存されない、nullが返る
  - workoutRepository/statsRepository: 外部キー制約違反
  - API routes: 各種エラー

### 22:05 - 原因調査

- 開発DB（whiskey）と テスト用DB（whiskey_test）の状態を確認
- **発見**: テストが開発DB（whiskey）に接続していた
- **根本原因**: `src/lib/prisma/prisma.ts`が`dotenv/config`をimportしているため、Prisma Client初期化時に`.env`が読み込まれていた

### 22:10 - 第1の修正: Prisma Client初期化

- `src/lib/prisma/prisma.ts`から`dotenv/config`を削除
- `vitest.config.ts`から`dotenv/config`を削除
- 環境変数の読み込みをdotenv-cliに一元化

### 22:12 - 第2の修正: workoutRepository.updateバグ修正

- `workoutRepository.update`メソッドが`date`と`dialy`フィールドを更新していないバグを発見
- Line 133-134に`date: data.date`と`dialy: data.dialy`を追加

### 22:14 - 第3の修正: テスト並列実行の無効化

- テストファイル間のデータ競合を発見
- `package.json`のtestスクリプトに`--no-file-parallelism`を追加
- Repository層テストが実DBを共有するため、並列実行で競合が発生していた

### 22:15 - 最終テスト結果

- **112/116テスト（96.6%）がパス**
- 残り4つの失敗は別の問題（モックの設定など）

## 完了サマリー

### 発見した問題

1. **Prisma Clientが開発DBに接続していた**
   - `dotenv/config`の重複読み込みが原因
   - テストが`whiskey_test`ではなく`whiskey`に接続

2. **workoutRepository.updateのバグ**
   - `date`と`dialy`フィールドが更新されていなかった
   - Detailsの更新のみ実装されていた

3. **テストの並列実行による競合**
   - 複数のテストファイルが同じDBに同時アクセス
   - `cleanupTestData()`の競合

### 実装内容

1. Prisma Client初期化の修正（dotenv/config削除）
2. workoutRepository.updateメソッドの修正
3. テスト並列実行の無効化

### 変更ファイル一覧

- [src/lib/prisma/prisma.ts](../src/lib/prisma/prisma.ts) - dotenv/config削除
- [vitest.config.ts](../vitest.config.ts) - dotenv/config削除
- [src/repositories/workoutRepository.ts](../src/repositories/workoutRepository.ts) - updateメソッド修正
- [package.json](../package.json) - テスト並列実行無効化

### テスト結果

**修正前**: 46/116テスト失敗（60%失敗率）
**修正後**: 112/116テストパス（96.6%成功率）

残り4つの失敗テスト:
- `WorkoutService.test.ts` - `createWorkout` (モックの問題)
- `dashboard/stats/route.test.ts` - 3テスト (500エラー、別調査が必要)

### 次のステップ

- [ ] 残り4つのテスト失敗の調査（別タスク）
- [x] テスト用DB分離の完了
- [x] Repository層テストの安定化
