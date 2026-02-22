import { request } from '@/shared/api';
import type {
  Workout,
  WorkoutDetail,
  WorkoutSet,
  RecordWorkoutRequest,
  SetInput,
  ContributionData,
  WeightProgressionData,
} from './types';

export const workoutApi = {
  record: (data: RecordWorkoutRequest) =>
    request<WorkoutDetail>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const query = params.toString();
    return request<Workout[]>(`/api/workouts${query ? `?${query}` : ''}`);
  },

  get: (id: string) => request<WorkoutDetail>(`/api/workouts/${id}`),

  updateMemo: (id: string, memo: string | null) =>
    request<Workout>(`/api/workouts/${id}/memo`, {
      method: 'PUT',
      body: JSON.stringify({ memo }),
    }),

  addSets: (id: string, sets: SetInput[]) =>
    request<WorkoutSet[]>(`/api/workouts/${id}/sets`, {
      method: 'POST',
      body: JSON.stringify({ sets }),
    }),

  delete: (id: string) =>
    request<void>(`/api/workouts/${id}`, { method: 'DELETE' }),

  deleteSet: (setId: string) =>
    request<void>(`/api/workout-sets/${setId}`, { method: 'DELETE' }),

  contributions: (startDate: string, endDate: string) => {
    const params = new URLSearchParams();
    params.set('start_date', startDate);
    params.set('end_date', endDate);
    return request<ContributionData[]>(
      `/api/workouts/contributions?${params.toString()}`,
    );
  },

  getWeightProgression: (exerciseId: string) =>
    request<WeightProgressionData[]>(
      `/api/exercises/${exerciseId}/progression`,
    ),
};
