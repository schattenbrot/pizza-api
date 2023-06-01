import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../utils/express';
import {
  DATABASE_NAME,
  DATABASE_PORT,
  DATABASE_PROTOCOL,
  DATABASE_URL,
} from '../utils/environment';
import pizzaService from '../services/pizza';
import { MongoMemoryServer } from 'mongodb-memory-server';
import PizzaModel, { Pizza } from '../models/pizza';

const mockedPizza = {
  _id: '6473dcfab93afd651b171a56',
  name: 'Salami 4',
  image: 'image.jpg',
  price: 6.99,
};

// const mockGetPizzaById = (mock: Pizza | null = mockedPizza) =>
//   jest
//     .spyOn(pizzaService, 'getPizzaById')
//     .mockImplementationOnce((pizzaId: string) => {
//       return new Promise((resolve, _reject) => {
//         resolve(mock ? new PizzaModel(mock) : null);
//       });
//     });

beforeEach(async () => {
  const mongodb = await MongoMemoryServer.create();
  await mongoose.connect(mongodb.getUri());
});
afterEach(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe('pizza', () => {
  // ----------------------------------------------------------------
  // CreatePizza route
  // ----------------------------------------------------------------
  describe('create pizza route', () => {
    const mockPizzaService = () =>
      jest
        .spyOn(pizzaService, 'createPizza')
        .mockImplementationOnce((pizza: Pizza) => {
          return new Promise((resolve, _reject) => {
            resolve(new PizzaModel(mockedPizza));
          });
        });

    describe('given the pizza is valid', () => {
      it('should return a 201 and the pizza', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send(mockedPizza);
        expect(statusCode).toBe(201);
        expect(body).toEqual(mockedPizza);
        expect(pizzaServiceMock).toHaveBeenCalledWith(mockedPizza);
      });
    });

    describe('given the pizza name is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / name] (undefined)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: 5,
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / name] (5)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza image is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: mockedPizza.name,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / image] (undefined)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: mockedPizza.name,
            image: 5,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / image] (5)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza price is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / price] (undefined)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });

      it('wrong format: should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
            price: '5,99',
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / price] (5,99)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });
    describe('given an error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const pizzaServiceMock = jest.spyOn(pizzaService, 'createPizza');
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send(mockedPizza);
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(pizzaServiceMock).toHaveBeenCalledWith(mockedPizza);
      });
    });
  });

  // ----------------------------------------------------------------
  // GetAllPizzas route
  // ----------------------------------------------------------------
  describe('get all pizzas route', () => {
    const mockPizzaService = (mock: Pizza | null = mockedPizza) =>
      jest.spyOn(pizzaService, 'getAllPizzas').mockImplementationOnce(() => {
        return new Promise((resolve, _reject) => {
          resolve(mock ? [new PizzaModel(mock)] : []);
        });
      });

    describe('given a pizza does exist', () => {
      it('should return a 200 and the pizza', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app).get(`/api/pizza`);
        expect(statusCode).toBe(200);
        expect(body).toEqual([mockedPizza]);
        expect(pizzaServiceMock).toHaveBeenCalled();
      });
    });

    describe('given no pizza does not exist', () => {
      it('should return a 404', async () => {
        const pizzaServiceMock = mockPizzaService(null);
        const { body, statusCode } = await supertest(app).get(`/api/pizza`);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
        expect(pizzaServiceMock).toHaveBeenCalled();
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const pizzaServiceMock = jest.spyOn(pizzaService, 'getAllPizzas');
        const { body, statusCode } = await supertest(app).get(`/api/pizza`);
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(pizzaServiceMock).toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetPizza route
  // ----------------------------------------------------------------
  describe('get pizza route', () => {
    const mockPizzaService = (mock: Pizza | null = mockedPizza) =>
      jest
        .spyOn(pizzaService, 'getPizzaById')
        .mockImplementationOnce((pizzaId: string) => {
          return new Promise((resolve, _reject) => {
            resolve(mock ? new PizzaModel(mock) : null);
          });
        });

    describe('given the pizza does exist', () => {
      it('should return a 200 and the pizza', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual(mockedPizza);
        expect(pizzaServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza does not exist', () => {
      it('should return a 404', async () => {
        const pizzaServiceMock = mockPizzaService(null);
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizza not found');
        expect(pizzaServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const pizzaServiceMock = jest.spyOn(pizzaService, 'getPizzaById');
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId);
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdatePizza route
  // ----------------------------------------------------------------
  describe('update pizza route', () => {
    const mockPizzaService = (mock: Pizza | null = mockedPizza) =>
      jest
        .spyOn(pizzaService, 'updatePizzaById')
        .mockImplementationOnce((pizzaId: string) => {
          return new Promise((resolve, _reject) => {
            resolve(mock ? new PizzaModel(mock) : null);
          });
        });

    describe('given the pizza is valid', () => {
      it('should return a 200 and the pizza', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send(mockedPizza);
        expect(statusCode).toBe(200);
        expect(body).toEqual(mockedPizza);
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId, mockedPizza);
      });
    });

    describe('given the pizza name is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / name] (undefined)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: 50,
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / name] (50)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza image is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / image] (undefined)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });

      it('not a string: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            image: 5,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / image] (5)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza price is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / price] (undefined)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });

      it('string: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
            price: '5,99',
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / price] (5,99)');
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizzaId is invalid', () => {
      it('should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a5';
        const pizzaServiceMock = mockPizzaService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza does not exist', () => {
      it('should return a 404 error', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = mockPizzaService(null);
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send(mockedPizza);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizza not found');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId, mockedPizza);
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500 error', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const pizzaId = '6473dcfab93afd651b171a56';
        const pizzaServiceMock = jest.spyOn(pizzaService, 'updatePizzaById');
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send(mockedPizza);
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId, mockedPizza);
      });
    });
  });

  // ----------------------------------------------------------------
  // DeletePizza route
  // ----------------------------------------------------------------
  describe('delete pizza route', () => {
    const mockPizzaService = (mock: Pizza | null = mockedPizza) =>
      jest
        .spyOn(pizzaService, 'deletePizzaById')
        .mockImplementationOnce((pizzaId: string) => {
          return new Promise((resolve, _reject) => {
            resolve(mock ? new PizzaModel(mock) : null);
          });
        });
    describe('given the deletion was successful', () => {
      it('should return a 200 response with the pizza', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual({ message: 'Pizza deleted successfully' });
        expect(pizzaServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422 error', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(pizzaServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizza does not exist', () => {
      it('should return a 404 error', async () => {
        const pizzaServiceMock = mockPizzaService(null);
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizza not found');
        expect(pizzaServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const pizzaServiceMock = jest.spyOn(pizzaService, 'deletePizzaById');
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId);
      });
    });
  });
});
