# WorkoutCardコンポーネントのリファクタリング

**作業日**: 2025-12-25
**担当**: Claude Code
**ステータス**: 完了

## 目的

WorkoutCardコンポーネント内に実装されていた統計計算ロジックをカスタムフック（useWorkoutCardStats）に切り出し、関心の分離と再利用性を向上させる。

## 課題

### リファクタリング前の問題点

WorkoutCard.tsxには以下の問題がありました：

1. **ロジックとUIの混在**: 統計計算ロジックがコンポーネント内に直接実装されていた
2. **複雑なuseEffect**: 統計計算をuseEffectとstateで管理していた
3. **再利用性の欠如**: 統計計算ロジックを他のコンポーネントで再利用できない
4. **テスタビリティの低下**: ロジックとUIが密結合でテストが困難
5. **パフォーマンス**: 不要な再レンダリングの可能性

元のコード構造:
```typescript
function WorkoutCard({ workout }) {
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      // 長い統計計算ロジック（50行以上）
      const fallbackStats: WorkoutStats = { /* ... */ };
      setWorkoutStats(fallbackStats);
    };
    fetchStats();
  }, [workout.id, workout.Detail]);

  if (!workoutStats) return;

  // UI描画...
}
```

## 作業内容

### 1. useWorkoutCardStatsカスタムフック作成

新しいカスタムフック `useWorkoutCardStats.ts` を作成し、統計計算ロジックを完全に分離。

**作成ファイル**: [src/app/(authorized)/dashboard/hooks/useWorkoutCardStats.ts](../../src/app/(authorized)/dashboard/hooks/useWorkoutCardStats.ts)

**主な機能**:
- **totalSets**: ワークアウトの総セット数
- **totalReps**: ワークアウトの総回数
- **totalWeight**: ワークアウトの総重量（kg）
- **totalDuration**: ワークアウトの総時間（秒）
- **exerciseCount**: 実施した種目数
- **intensity**: 強度情報（レベル/色/テキスト）
  - レベル1-5（種目数÷2で計算）
  - 軽め（緑）/ 普通（オレンジ）/ 高強度（赤）
- **workoutType**: ワークアウトタイプ（筋トレ/有酸素/ミックス/体重）

**技術的な実装**:
```typescript
export function useWorkoutCardStats(workout: WorkoutWithDetails): WorkoutStats {
  return useMemo(() => {
    // 統計計算ロジック
    // ...
    return {
      totalSets,
      totalReps,
      totalWeight,
      totalDuration,
      exerciseCount,
      intensity,
      workoutType,
    };
  }, [workout.Detail, workout.Detail.length]);
}
```

**useMemoによる最適化**:
- `workout.Detail`と`workout.Detail.length`を依存配列に指定
- ワークアウトデータが変更されない限り、統計を再計算しない
- パフォーマンスの向上

### 2. WorkoutCard.tsxリファクタリング

WorkoutCardコンポーネントをシンプルに書き換え。

**変更内容**:
- ✅ `useState`と`useEffect`を削除
- ✅ `useWorkoutCardStats`フックを使用
- ✅ 統計計算ロジック（約50行）を削除
- ✅ `WorkoutStats`インターフェースをフックに移動
- ✅ ローディング状態の削除（同期的に統計を取得）

**リファクタリング後のコード**:
```typescript
function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  const router = useRouter();
  const workoutStats = useWorkoutCardStats(workout); // カスタムフック使用

  const handleWorkoutClick = useCallback(() => {
    router.push(`/workouts/${workout.id}`);
  }, [router, workout.id]);

  return (
    <Card /* ... */>
      {/* UIのみ */}
    </Card>
  );
}
```

## コード削減

### WorkoutCard.tsx

- **削減前**: 約253行
- **削減後**: 約183行
- **削減量**: 約70行（約28%削減）

削除されたコード:
- `useState`と`useEffect`（約50行）
- `WorkoutStats`インターフェース（約15行）
- ローディング状態の条件分岐（約3行）

## 変更ファイル

### 新規作成

- [src/app/(authorized)/dashboard/hooks/useWorkoutCardStats.ts](../../src/app/(authorized)/dashboard/hooks/useWorkoutCardStats.ts) - カスタムフック作成
- [src/app/(authorized)/dashboard/components/WorkoutCard/WorkoutCard.stories.tsx](../../src/app/(authorized)/dashboard/components/WorkoutCard/WorkoutCard.stories.tsx) - Storybookストーリー作成

### 修正

- [src/app/(authorized)/dashboard/components/WorkoutCard/WorkoutCard.tsx](../../src/app/(authorized)/dashboard/components/WorkoutCard/WorkoutCard.tsx) - カスタムフック使用に書き換え

### 作業ログ

- [docs/work-logs/2025-12-25-workout-card-refactoring.md](../../docs/work-logs/2025-12-25-workout-card-refactoring.md) - この作業ログ

## アーキテクチャ上のメリット

### 1. 関心の分離

- **統計計算ロジック**: `useWorkoutCardStats`フック
- **UI表示ロジック**: `WorkoutCard`コンポーネント

完全に責務が分離され、それぞれが単一責任を持つようになりました。

### 2. 再利用性の向上

`useWorkoutCardStats`は他のコンポーネントでも使用可能:
- WorkoutList
- WorkoutDetail
- StatisticsPage
- など

### 3. テスタビリティの向上

- **フック単体でテスト可能**: ロジックを独立してテスト
- **コンポーネントのテストが簡単**: UIのみをテスト
- **モック不要**: フックの戻り値をモックするだけ

### 4. パフォーマンスの改善

- **useMemoによる最適化**: 不要な再計算を防止
- **同期的な計算**: useEffectによる非同期処理が不要
- **ローディング状態の削除**: 即座に統計を表示

### 5. 可読性の向上

- **WorkoutCard.tsx**: UIに集中したコード（約183行）
- **useWorkoutCardStats.ts**: 統計計算に集中したコード（約95行）
- **明確な責務**: それぞれが何をするのか一目瞭然

### 6. 保守性の向上

- **変更の影響範囲が明確**: 統計計算の変更はフックのみ
- **バグの特定が容易**: ロジックとUIが分離されている
- **一貫性**: 統計計算ロジックが一箇所に集約

## 技術仕様

### useWorkoutCardStatsフックの依存配列

```typescript
useMemo(() => {
  // 計算ロジック
}, [workout.Detail, workout.Detail.length]);
```

**理由**:
- `workout.Detail`: ワークアウト詳細が変更された場合に再計算
- `workout.Detail.length`: 種目数が変更された場合に再計算
- `workout.id`は不要（Detailが変わればidも変わる）

### 強度レベルの計算ロジック

```typescript
const intensityLevel = Math.min(5, Math.ceil(exerciseCount / 2));
```

- 種目数÷2を上限5でレベル化
- 1-2種目: レベル1（軽め/緑）
- 3-4種目: レベル2（普通/オレンジ）
- 5種目以上: レベル3-5（高強度/赤）

### ワークアウトタイプの判定ロジック

```typescript
const hasCardio = workout.Detail.some(detail => detail.duration > 0);
const hasWeights = workout.Detail.some(detail => detail.weight > 0);
```

- **筋トレ**: 重量あり、時間なし
- **有酸素**: 時間あり、重量なし
- **ミックス**: 重量あり、時間あり
- **体重**: 重量なし、時間なし

## 完了サマリー

### 実装内容

1. **useWorkoutCardStatsフック作成**
   - 統計計算ロジックを完全に分離
   - useMemoによるパフォーマンス最適化
   - 型安全な実装（WorkoutStatsインターフェース）

2. **WorkoutCardコンポーネント簡素化**
   - 約70行のコード削減（約28%削減）
   - useState/useEffectの削除
   - UIロジックに集中

3. **Storybookストーリー作成**
   - 8つのストーリーバリエーションを作成
   - MSW不要のシンプルな実装（useWorkoutCardStatsが同期的に計算）
   - 様々なワークアウトパターンをカバー

4. **アーキテクチャ改善**
   - 関心の分離
   - 再利用性の向上
   - テスタビリティの向上
   - パフォーマンスの改善

### メリット

- ✅ **関心の分離**: ロジックとUIの完全分離
- ✅ **再利用性**: 統計ロジックを他のコンポーネントでも使用可能
- ✅ **テスタビリティ**: フックとコンポーネントを独立してテスト可能
- ✅ **パフォーマンス**: useMemoによる最適化
- ✅ **可読性**: 各ファイルが単一責任を持つ
- ✅ **保守性**: 変更の影響範囲が明確

### 最終的なコンポーネント構成

```
WorkoutCard (約183行) - UI表示のみ
├── useWorkoutCardStats (約95行) - 統計計算ロジック
│   ├── totalSets計算
│   ├── totalWeight計算
│   ├── totalDuration計算
│   ├── intensity計算
│   └── workoutType判定
└── WorkoutItem - 詳細アイテム表示
```

## Storybookストーリー

### 作成したストーリー（8種類）

1. **Default**: 標準的なワークアウト（筋トレ2種目、メモあり）
2. **WithoutMemo**: メモなしのワークアウト
3. **CardioWorkout**: 有酸素運動のワークアウト（ランニング30分）
4. **MixedWorkout**: 筋トレ+有酸素のミックスワークアウト
5. **HighIntensity**: 高強度ワークアウト（5種目）
6. **SingleExercise**: 1種目のみのワークアウト
7. **BodyweightWorkout**: 自重トレーニング（体重タイプ）
8. **WithNotes**: 詳細メモ付きワークアウト
9. **LongExerciseNames**: 長い種目名での表示確認

### Storybookの特徴

- **MSW不要**: useWorkoutCardStatsが同期的に計算するため、APIモック不要
- **シンプルな実装**: サンプルデータを渡すだけで統計が自動計算される
- **高速**: 非同期処理がないため即座に表示
- **網羅的**: ワークアウトタイプ（筋トレ/有酸素/ミックス/体重）を全てカバー

リファクタリング前は、APIモック（MSW）が必要だったが、useWorkoutCardStatsフックにより同期的に統計を計算できるようになったため、Storybookの実装が大幅に簡素化されました。

## 備考

- Material-UI v6使用
- useMemoでパフォーマンス最適化
- 型安全な実装（TypeScript）
- 既存のコード構造と一貫性のある設計
- MonthlyProgressChart、WeeklyActivityChartと同様のパターン（カスタムフック分離）
- Storybookの実装がリファクタリングにより大幅に簡素化（MSW不要）
