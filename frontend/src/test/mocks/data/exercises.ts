import type { Exercise } from '@/features/exercise/types';

export const mockExercises: Exercise[] = [
  {
    id: 'e1',
    name: 'ベンチプレス',
    description: null,
    body_part: 'chest',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'e2',
    name: 'スクワット',
    description: null,
    body_part: 'legs',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'e3',
    name: 'デッドリフト',
    description: null,
    body_part: 'back',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];
