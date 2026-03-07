import { fn } from '@storybook/test';
import preview from '../../../../../.storybook/preview';
import { RecentWorkoutsList } from './RecentWorkoutsList';
import type { Workout } from '@/features/workout';

const sampleWorkouts: Workout[] = [
  {
    id: 'w1',
    user_id: 'u1',
    date: '2026-02-07T00:00:00Z',
    daily_score: 3,
    memo: null,
    created_at: '2026-02-07T10:00:00Z',
    updated_at: '2026-02-07T10:00:00Z',
  },
  {
    id: 'w2',
    user_id: 'u1',
    date: '2026-02-08T00:00:00Z',
    daily_score: 4,
    memo: 'レッグデー',
    created_at: '2026-02-08T10:00:00Z',
    updated_at: '2026-02-08T10:00:00Z',
  },
  {
    id: 'w3',
    user_id: 'u1',
    date: '2026-02-10T00:00:00Z',
    daily_score: 5,
    memo: '胸・肩トレ',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  },
];

const meta = preview.meta({
  component: RecentWorkoutsList,
  title: 'features/dashboard/RecentWorkoutsList',
  args: {
    workouts: sampleWorkouts,
    onClickWorkout: fn(),
  },
});

export default meta;

export const Default = meta.story({});

export const Empty = meta.story({
  args: { workouts: [] },
});

export const Loading = meta.story({
  args: { workouts: [], loading: true },
});
