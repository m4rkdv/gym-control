import { http, HttpResponse } from 'msw';

const mockData = {
  users: [
    { id: '1', name: 'Jon Snow', email: 'jon@snow.com' },
    { id: '2', name: 'Tyrion Lannister', email: 'tyrion@lannister.com' }
  ],
  createdUser: { id: '3', name: 'New User', email: 'new@example.com' }
};

export const apiHandlers = [
  http.get('*/api/users', () => {
    return HttpResponse.json(mockData.users);
  }),

  http.post('*/api/users', () => {
    return HttpResponse.json(mockData.createdUser, { status: 201 });
  }),

  // Error endpoint for testing
  http.get('*/api/error', () => {
    return HttpResponse.json({ error: 'Server error' }, { status: 500 });
  })
];

export const testApiData = {
  ...mockData,
  validPayload: { name: 'Test User', email: 'test@example.com' }
};
