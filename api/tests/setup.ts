import { mockMongo, resetMongo, stopMongo } from './db';

beforeAll(async () => {
  await mockMongo();
});

beforeEach(async () => {
  await mockMongo();
  await resetMongo();
});

afterAll(async () => {
  await stopMongo();
});
