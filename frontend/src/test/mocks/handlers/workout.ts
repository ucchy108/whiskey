import { http, HttpResponse } from 'msw';
import { mockWorkouts, mockWorkoutDetails, mockContributions } from '../data';

export const workoutHandlers = [
  http.get('/api/workouts/contributions', () => {
    return HttpResponse.json(mockContributions);
  }),

  http.get('/api/workouts', () => {
    return HttpResponse.json(mockWorkouts);
  }),

  http.get('/api/workouts/:id', ({ params }) => {
    const detail = mockWorkoutDetails[params.id as string];
    if (!detail) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),

  http.post('/api/workouts', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        workout: {
          id: `w${Date.now()}`,
          user_id: 'u1',
          date: body.date,
          daily_score: 1,
          memo: body.memo ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        sets: [],
      },
      { status: 201 },
    );
  }),

  http.put('/api/workouts/:id/memo', async ({ params, request }) => {
    const detail = mockWorkoutDetails[params.id as string];
    if (!detail) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const body = (await request.json()) as { memo: string | null };
    return HttpResponse.json({
      ...detail.workout,
      memo: body.memo,
      updated_at: new Date().toISOString(),
    });
  }),

  http.post('/api/workouts/:id/sets', async ({ request }) => {
    const body = (await request.json()) as {
      sets: Record<string, unknown>[];
    };
    const newSets = body.sets.map((s, i) => ({
      ...s,
      id: `s${Date.now()}-${i}`,
      estimated_1rm: 100,
      created_at: new Date().toISOString(),
    }));
    return HttpResponse.json(newSets, { status: 201 });
  }),

  http.delete('/api/workouts/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('/api/workout-sets/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
