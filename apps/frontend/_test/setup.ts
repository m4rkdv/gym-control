import { beforeAll, afterEach, afterAll } from 'vitest';
import 'dotenv/config';
import { setupServer } from 'msw/node';
import { authHandlers } from './mocks/auth-handler';
import { apiHandlers } from './mocks/api-handler';


export const server = setupServer(...authHandlers, ...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());