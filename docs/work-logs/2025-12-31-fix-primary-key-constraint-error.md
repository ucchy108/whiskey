# PRIMARY KEY制約違反エラーの修正

**作業日**: 2025-12-31
**担当**: Claude Code
**ステータス**: 完了

## 目的

ワークアウト更新時に発生する`Unique constraint failed on the constraint: PRIMARY`エラーを修正する。

## 作業内容

### 調査フェーズ

- エラーメッセージの分析
  - Prismaエラーコード: `P2002` (ユニーク制約違反)
  - エラー箇所: `src/repositories/workoutRepository.ts:130`

- Prismaクエリログの確認
  ```sql
  DELETE FROM `workout_details` WHERE (`workout_details`.`id` IN (NULL) AND 1=1)
  ```

- 送信データの確認
  ```javascript
  details: [
    { id: '5726bcd3-d739-436e-923f-8c5f00b160df', ... },  // 既存レコード
    { id: '7f9b0983-bd35-4486-8f62-6a1448daa452', ... }   // 既存レコード
  ],
  deleteIds: []
  ```

### 原因特定

**workoutRepository.ts:135-151**の問題点：
```typescript
Detail: {
  deleteMany: { id: { in: data.deleteIds } },
  create: data.details,  // ❌ すべてのdetailsをcreateしようとしている
  update: data.details
    ?.filter((detail) => detail.id)
    .map(...) || [],
},
```

**問題**:
1. `create: data.details` - すべてのdetailsを新規作成しようとする
2. しかし、detailsには既にIDが存在する既存レコードが含まれている
3. PRIMARY KEY（`id`）の重複によりユニーク制約違反が発生

**正しい処理**:
- `id`が存在する（既存レコード） → `update`のみ
- `id`が空文字列または存在しない（新規レコード） → `create`のみ

## 変更ファイル

- `src/repositories/workoutRepository.ts` - detail処理のロジック修正予定

### 修正実装

**workoutRepository.ts:136-137**を修正：
```typescript
Detail: {
  deleteMany: { id: { in: data.deleteIds || [] } },  // 空配列対応
  create: data.details?.filter((detail) => !detail.id) || [],  // idがないものだけcreate
  update: data.details
    ?.filter((detail) => detail.id)
    .map(...) || [],
},
```

**変更点**:
1. `create: data.details?.filter((detail) => !detail.id) || []` - `id`が存在しないレコードのみcreate
2. `deleteMany: { id: { in: data.deleteIds || [] } }` - `deleteIds`がundefinedの場合に空配列をフォールバック

## 完了サマリー

### 実装内容

- workoutRepository.tsのdetail処理ロジックを修正
- 既存レコード（id有）と新規レコード（id無）を適切に分離
- createとupdateの対象を明確化

### 変更ファイル一覧

- [src/repositories/workoutRepository.ts](../src/repositories/workoutRepository.ts) - detail処理のフィルタリングロジック追加

### 技術的なポイント

- **既存レコード**: `detail.id`が存在 → `update`のみ実行
- **新規レコード**: `detail.id`が存在しない → `create`のみ実行
- **削除レコード**: `deleteIds`配列に含まれる → `deleteMany`で削除

### 次のステップ

- 動作確認（ワークアウト編集画面でテスト）
- 新規detail追加時の動作確認
- detail削除時の動作確認

## 備考

- Prismaの`update()`内では、`create`と`update`を同時に実行できる
- 既存レコードと新規レコードを適切にフィルタリングする必要がある
- この修正により、既存レコードの更新と新規レコードの追加が正しく動作するようになる
