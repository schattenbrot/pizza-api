import supertest from 'supertest';
import app from '../../config/app.config';

describe('default', () => {
  // ----------------------------------------------------------------
  // Welcome / Home API route
  // ----------------------------------------------------------------
  describe('welcome message', () => {
    it('should return a 200 response and the welcome message', async () => {
      const { body, statusCode } = await supertest(app).get(`/`);
      expect(statusCode).toBe(200);
      expect(body).toEqual({ message: 'Welcome to the pizza api!' });
    });
  });

  // ----------------------------------------------------------------
  // 404 NotFound route
  // ----------------------------------------------------------------
  describe('page not found', () => {
    it('should return a 404 error', async () => {
      const path = '/notfound';
      const { body, statusCode } = await supertest(app).get(`${path}`);
      expect(statusCode).toBe(404);
      expect(body.statusCode).toBe(404);
      expect(body.message).toBe(`Page ${path} not found`);
    });
  });

  // ----------------------------------------------------------------
  // Swagger route
  // ----------------------------------------------------------------
  describe('swagger ui', () => {
    it('should return a 200 response and an html body', async () => {
      const { statusCode, body } = await supertest(app)
        .get('/docs.json')
        .redirects(1);

      expect(statusCode).toBe(200);
      expect(body.info.title).toBe('Pizza API');
    });
  });
});
