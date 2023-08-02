import { mockMongo, resetMongo, stopMongo } from './db';

beforeAll(async () => {
  await mockMongo();
});

beforeEach(async () => {
  await resetMongo();
});

afterAll(async () => {
  await stopMongo();
});
