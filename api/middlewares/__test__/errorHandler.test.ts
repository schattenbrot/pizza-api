import supertest from 'supertest';

describe('Error Handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    jest.clearAllMocks();
  });
  it('should include stack in the response in development mode', async () => {
    process.env.NODE_ENV = 'development';

    const { default: app } = require('../../utils/express');

    const path = '/nope';
    const { statusCode, body } = await supertest(app).get(path);
    expect(statusCode).toBe(404);
    expect(body.statusCode).toBe(404);
    expect(body.message).toBe(`Page ${path} not found`);
    expect(body.stack).toBeDefined();
  });

  it('should not include stack in the response in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const { default: app } = require('../../utils/express');

    const path = '/nope';
    const { statusCode, body } = await supertest(app).get(path);
    expect(statusCode).toBe(404);
    expect(body.statusCode).toBe(404);
    expect(body.message).toBe(`Page ${path} not found`);
    expect(body.stack).toBeUndefined();
  });

  it('should not include stack in the response in test mode', async () => {
    process.env.NODE_ENV = 'test';
    const { default: app } = require('../../utils/express');

    const path = '/nope';
    const { statusCode, body } = await supertest(app).get(path);
    expect(statusCode).toBe(404);
    expect(body.statusCode).toBe(404);
    expect(body.message).toBe(`Page ${path} not found`);
    expect(body.stack).toBeUndefined();
  });
});
