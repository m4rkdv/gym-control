import { beforeAll, afterEach, afterAll } from 'vitest';
import 'dotenv/config';
import { setupServer } from 'msw/node';
import { authHandlers } from './mocks/auth-handler';


export const server = setupServer(...authHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());