import { http, HttpResponse } from 'msw';
import { mockExercises } from '../data';

export const exerciseHandlers = [
  http.get('/api/exercises', ({ request }) => {
    const url = new URL(request.url);
    const bodyPart = url.searchParams.get('body_part');
    const filtered = bodyPart
      ? mockExercises.filter((e) => e.body_part === bodyPart)
      : mockExercises;
    return HttpResponse.json(filtered);
  }),

  http.get('/api/exercises/:id', ({ params }) => {
    const exercise = mockExercises.find((e) => e.id === params.id);
    if (!exercise) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(exercise);
  }),

  http.post('/api/exercises', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: `e${Date.now()}`,
        name: body.name,
        description: body.description ?? null,
        body_part: body.body_part ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  http.put('/api/exercises/:id', async ({ params, request }) => {
    const exercise = mockExercises.find((e) => e.id === params.id);
    if (!exercise) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...exercise,
      ...body,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete('/api/exercises/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
