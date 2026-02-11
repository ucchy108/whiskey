import { http, HttpResponse } from 'msw';
import { mockUser } from '../data';

export const authHandlers = [
  http.post('/api/users', () => {
    return HttpResponse.json(mockUser, { status: 201 });
  }),

  http.post('/api/auth/login', () => {
    return HttpResponse.json(mockUser);
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
