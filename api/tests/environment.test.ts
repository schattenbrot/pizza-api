describe('Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should have default values if environment variables are not set', async () => {
    delete process.env.NODE_ENV; // gets set to test when using jest

    const environment = require('../utils/environment');
    const app = require('../utils/express');

    expect(environment.SERVER).toBe('localhost');
    expect(environment.NODE_ENV).toBe('development');
    expect(environment.PORT).toBe(8080);
    expect(environment.CORS_ORIGIN).toBe('*');
    expect(environment.DATABASE_PROTOCOL).toBe('mongodb');
    expect(environment.DATABASE_URL).toBe('localhost');
    expect(environment.DATABASE_PORT).toBe(27017);
    expect(environment.DATABASE_NAME).toBe('pizzaShop');
    expect(environment.AUTH).toBeUndefined();
  });

  it('should set environment variables if provided', () => {
    process.env.SERVER = 'example.com';
    process.env.NODE_ENV = 'production';
    process.env.PORT = '3000';
    process.env.CORS_ORIGIN = 'https://example.com';
    process.env.DATABASE_PROTOCOL = 'mysql';
    process.env.DATABASE_URL = 'db.example.com';
    process.env.DATABASE_PORT = '3306';
    process.env.DATABASE_NAME = 'myDB';
    process.env.DATABASE_USER = 'admin';
    process.env.DATABASE_PASSWORD = 'secret';

    const updatedEnvironment = require('../utils/environment');

    expect(updatedEnvironment.SERVER).toBe('example.com');
    expect(updatedEnvironment.NODE_ENV).toBe('production');
    expect(updatedEnvironment.PORT).toBe(3000);
    expect(updatedEnvironment.CORS_ORIGIN).toBe('https://example.com');
    expect(updatedEnvironment.DATABASE_PROTOCOL).toBe('mysql');
    expect(updatedEnvironment.DATABASE_URL).toBe('db.example.com');
    expect(updatedEnvironment.DATABASE_PORT).toBe(3306);
    expect(updatedEnvironment.DATABASE_NAME).toBe('myDB');
    expect(updatedEnvironment.DATABASE_USER).toBe('admin');
    expect(updatedEnvironment.DATABASE_PASSWORD).toBe('secret');
  });
});
