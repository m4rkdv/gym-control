import { http, HttpResponse } from 'msw';

// Placeholder auth handlers; extend as needed for tests.
export const authHandlers = [
  http.post('/api/login', async () => {
    return HttpResponse.json({ token: 'mock-token' });
  }),
];
