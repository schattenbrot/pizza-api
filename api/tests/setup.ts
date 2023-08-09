import supertest from 'supertest';
import { mockMongo, resetMongo, stopMongo } from './db';
import app from '../config/app.config';
import { IUserDocument } from '../models/user.model';

declare global {
  var signup: () => Promise<{ user: IUserDocument; cookie: string[] }>;
}

beforeAll(async () => {
  await mockMongo();
});

beforeEach(async () => {
  await resetMongo();
});

afterAll(async () => {
  await stopMongo();
});

global.signup = async () => {
  const email = 'test@test.com';
  const password = 'abCD12!@';

  const response = await supertest(app)
    .post('/api/auth/sign-up')
    .send({
      email,
      password,
    })
    .expect(201);
  const cookie = response.get('Set-Cookie');

  return { user: response.body, cookie };
};
