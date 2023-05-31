import { NODE_ENV, SERVER } from '../utils/environment';

describe('CORS Options', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  it('should have the correct origin based on the environment: production', () => {
    process.env.NODE_ENV = 'production';
    const { default: corsOptions } = require('../utils/corsOptions');
    const expectedProtocol = 'https';
    const expectedOrigin = `${expectedProtocol}://${SERVER}`;

    expect(corsOptions.origin).toBe(expectedOrigin);
  });

  it('should have the correct origin based on the environment: development', () => {
    process.env.NODE_ENV = 'development';
    const { default: corsOptions } = require('../utils/corsOptions');
    const expectedProtocol = 'http';
    const expectedOrigin = `${expectedProtocol}://${SERVER}`;

    expect(corsOptions.origin).toBe(expectedOrigin);
  });

  it('should include the allowed methods', () => {
    const expectedMethods = [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ];
    const { default: corsOptions } = require('../utils/corsOptions');

    expect(corsOptions.methods).toEqual(expectedMethods);
  });

  it('should include the allowed headers', () => {
    const expectedHeaders = ['Origin', 'Content-Type', 'Authorization'];
    const { default: corsOptions } = require('../utils/corsOptions');

    expect(corsOptions.allowedHeaders).toEqual(expectedHeaders);
  });

  it('should include the exposed headers', () => {
    const expectedExposedHeaders = ['Content-Length'];
    const { default: corsOptions } = require('../utils/corsOptions');

    expect(corsOptions.exposedHeaders).toEqual(expectedExposedHeaders);
  });

  it('should allow credentials', () => {
    const { default: corsOptions } = require('../utils/corsOptions');
    expect(corsOptions.credentials).toBe(true);
  });

  it('should set the max age', () => {
    const expectedMaxAge = 12 * 3600;
    const { default: corsOptions } = require('../utils/corsOptions');

    expect(corsOptions.maxAge).toBe(expectedMaxAge);
  });
});
