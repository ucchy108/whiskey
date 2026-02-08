import { request } from '@/shared/api';
import type { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from './types';

export const exerciseApi = {
  list: (bodyPart?: string) => {
    const params = bodyPart ? `?body_part=${encodeURIComponent(bodyPart)}` : '';
    return request<Exercise[]>(`/api/exercises${params}`);
  },

  get: (id: string) => request<Exercise>(`/api/exercises/${id}`),

  create: (data: CreateExerciseRequest) =>
    request<Exercise>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateExerciseRequest) =>
    request<Exercise>(`/api/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/exercises/${id}`, { method: 'DELETE' }),
};
