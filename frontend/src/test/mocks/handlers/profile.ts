import { http, HttpResponse } from 'msw';
import { mockProfile } from '../data';

export const profileHandlers = [
  http.post('/api/profile', () => {
    return HttpResponse.json(mockProfile, { status: 201 });
  }),

  http.get('/api/profile', () => {
    return HttpResponse.json(mockProfile);
  }),

  http.put('/api/profile', () => {
    return HttpResponse.json(mockProfile);
  }),

  http.post('/api/profile/avatar', () => {
    return HttpResponse.json({
      upload_url: 'https://s3.example.com/presigned-put-url',
      key: 'whiskey/users/u1/avatar/image.jpg',
    });
  }),

  http.get('/api/profile/avatar', () => {
    return HttpResponse.json({
      url: 'https://s3.example.com/presigned-get-url',
    });
  }),

  http.delete('/api/profile/avatar', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
