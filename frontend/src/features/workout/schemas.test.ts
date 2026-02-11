import {
  setInputSchema,
  exerciseBlockSchema,
  workoutFormSchema,
  memoSchema,
} from './schemas';

describe('setInputSchema', () => {
  it('正常な重量とレップ数でバリデーション通過', () => {
    const result = setInputSchema.safeParse({ weight: '60', reps: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weight).toBe(60);
      expect(result.data.reps).toBe(10);
    }
  });

  it('重量0でもバリデーション通過', () => {
    const result = setInputSchema.safeParse({ weight: '0', reps: '5' });
    expect(result.success).toBe(true);
  });

  it('小数の重量でもバリデーション通過', () => {
    const result = setInputSchema.safeParse({ weight: '2.5', reps: '12' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weight).toBe(2.5);
    }
  });

  it('負の重量でエラー', () => {
    const result = setInputSchema.safeParse({ weight: '-1', reps: '10' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'weight');
      expect(errors[0].message).toBe('0以上で入力してください');
    }
  });

  it('レップ数0でエラー', () => {
    const result = setInputSchema.safeParse({ weight: '60', reps: '0' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'reps');
      expect(errors[0].message).toBe('1以上で入力してください');
    }
  });

  it('レップ数が小数でエラー', () => {
    const result = setInputSchema.safeParse({ weight: '60', reps: '1.5' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'reps');
      expect(errors[0].message).toBe('整数で入力してください');
    }
  });

  it('重量が文字列でエラー', () => {
    const result = setInputSchema.safeParse({ weight: 'abc', reps: '10' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'weight');
      expect(errors.length).toBeGreaterThan(0);
    }
  });

  it('空文字でエラー', () => {
    const result = setInputSchema.safeParse({ weight: '', reps: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const weightErrors = result.error.issues.filter((i) => i.path[0] === 'weight');
      const repsErrors = result.error.issues.filter((i) => i.path[0] === 'reps');
      expect(weightErrors[0].message).toBe('数値を入力してください');
      expect(repsErrors[0].message).toBe('数値を入力してください');
    }
  });
});

describe('exerciseBlockSchema', () => {
  it('正常なエクササイズブロックでバリデーション通過', () => {
    const result = exerciseBlockSchema.safeParse({
      exerciseId: 'some-uuid',
      sets: [{ weight: '60', reps: '10' }],
    });
    expect(result.success).toBe(true);
  });

  it('空のexerciseIdでエラー', () => {
    const result = exerciseBlockSchema.safeParse({
      exerciseId: '',
      sets: [{ weight: '60', reps: '10' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter(
        (i) => i.path[0] === 'exerciseId',
      );
      expect(errors[0].message).toBe('エクササイズを選択してください');
    }
  });

  it('空のセット配列でエラー', () => {
    const result = exerciseBlockSchema.safeParse({
      exerciseId: 'some-uuid',
      sets: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'sets');
      expect(errors[0].message).toBe('セットを1つ以上追加してください');
    }
  });
});

describe('workoutFormSchema', () => {
  const validForm = {
    date: '2026-02-07',
    exerciseBlocks: [
      {
        exerciseId: 'uuid-1',
        sets: [{ weight: '60', reps: '10' }],
      },
    ],
    memo: 'テストメモ',
  };

  it('正常なフォームデータでバリデーション通過', () => {
    const result = workoutFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it('メモなしでもバリデーション通過', () => {
    const result = workoutFormSchema.safeParse({
      ...validForm,
      memo: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('空の日付でエラー', () => {
    const result = workoutFormSchema.safeParse({ ...validForm, date: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'date');
      expect(errors[0].message).toBe('日付を入力してください');
    }
  });

  it('空のエクササイズブロック配列でエラー', () => {
    const result = workoutFormSchema.safeParse({
      ...validForm,
      exerciseBlocks: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter(
        (i) => i.path[0] === 'exerciseBlocks',
      );
      expect(errors[0].message).toBe('エクササイズを1つ以上追加してください');
    }
  });
});

describe('memoSchema', () => {
  it('正常なメモでバリデーション通過', () => {
    const result = memoSchema.safeParse({ memo: 'テストメモ' });
    expect(result.success).toBe(true);
  });

  it('空のメモでもバリデーション通過', () => {
    const result = memoSchema.safeParse({ memo: '' });
    expect(result.success).toBe(true);
  });

  it('メモなしでもバリデーション通過', () => {
    const result = memoSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('500文字超でエラー', () => {
    const result = memoSchema.safeParse({ memo: 'a'.repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.issues.filter((i) => i.path[0] === 'memo');
      expect(errors[0].message).toBe('メモは500文字以内で入力してください');
    }
  });
});
