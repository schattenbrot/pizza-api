describe('CORS Options', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should have the correct origin', () => {
    const { default: corsOptions } = require('../cors.config');
    expect(corsOptions.origin).toBe('*');
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
    const { default: corsOptions } = require('../cors.config');

    expect(corsOptions.methods).toEqual(expectedMethods);
  });

  it('should include the allowed headers', () => {
    const expectedHeaders = ['Origin', 'Content-Type', 'Authorization'];
    const { default: corsOptions } = require('../cors.config');

    expect(corsOptions.allowedHeaders).toEqual(expectedHeaders);
  });

  it('should include the exposed headers', () => {
    const expectedExposedHeaders = ['Content-Length'];
    const { default: corsOptions } = require('../cors.config');

    expect(corsOptions.exposedHeaders).toEqual(expectedExposedHeaders);
  });

  it('should allow credentials', () => {
    const { default: corsOptions } = require('../cors.config');
    expect(corsOptions.credentials).toBe(true);
  });

  it('should set the max age', () => {
    const expectedMaxAge = 12 * 3600;
    const { default: corsOptions } = require('../cors.config');

    expect(corsOptions.maxAge).toBe(expectedMaxAge);
  });
});
