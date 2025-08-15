import { http, HttpResponse } from 'msw';

const validUser = {
  id: 'user-1',
  userName: 'jon@snow',
  role: 'member',
  isActive: true,
  memberId: 'member-1',
  createdAt: new Date().toISOString()
};

export const authHandlers = [
  http.post('*/api/auth/login', async () => {
    return HttpResponse.json({
      user: validUser,
      token: 'mock-jwt-token'
    });
  }),
  
  http.post('*/api/auth/register', async () => {
    return HttpResponse.json({
      user: validUser,
      token: 'mock-jwt-token'
    }, { status: 201 });
  }),
];

export const testData = {
  validUser,
  validCredentials: {
    userName: 'jon@snow',
    password: 'ghost123'
  }
};
