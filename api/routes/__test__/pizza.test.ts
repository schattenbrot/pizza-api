import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../../config/app.config';
import { IPizza, IPizzaDocument } from '../../models/pizza.model';
import pizzaService from '../../services/pizza.service';

const mockedPizza: IPizza = {
  name: 'Salami',
  image: 'image.jpg',
  price: 6.99,
};

describe('pizza', () => {
  // ----------------------------------------------------------------
  // CreatePizza route
  // ----------------------------------------------------------------
  describe('create pizza route', () => {
    describe('given the pizza is valid', () => {
      it('should return a 201 and the pizza', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send(mockedPizza);
        expect(statusCode).toBe(201);
        expect(body.name).toBe(mockedPizza.name);
        expect(body.image).toBe(mockedPizza.image);
        expect(body.price).toBe(mockedPizza.price);
      });
    });

    describe('given the pizza name is invalid', () => {
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / name] (undefined)');
      });

      it('number: should return a 422', async () => {
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
      });
    });

    describe('given the pizza image is invalid', () => {
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: mockedPizza.name,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / image] (undefined)');
      });

      it('number: should return a 422', async () => {
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
      });
    });

    describe('given the pizza price is invalid', () => {
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / price] (undefined)');
      });

      it('wrong format: should return a 422', async () => {
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
      });
    });

    describe('given an internal server error occurred', () => {
      const mockPizzaService = () =>
        jest.spyOn(pizzaService, 'createPizza').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return a 500 error', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { statusCode } = await supertest(app)
          .post(`/api/pizza`)
          .send(mockedPizza);
        expect(statusCode).toBe(500);
        expect(pizzaServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetAllPizzas route
  // ----------------------------------------------------------------
  describe('get all pizzas route', () => {
    const mockPizzas = async () => {
      let pizzas: IPizzaDocument[] = [];

      for (let i = 0; i < 3; i++) {
        const pizza = await pizzaService.createPizza(mockedPizza);
        pizzas.push(pizza.toObject());
      }

      return pizzas;
    };

    describe('given a pizza does exist', () => {
      it('should return a 200 and the pizza', async () => {
        const pizzas = await mockPizzas();
        const { body, statusCode } = await supertest(app).get(`/api/pizza`);
        expect(statusCode).toBe(200);
        expect(body).toEqual(pizzas);
      });
    });

    describe('given no pizza does not exist', () => {
      it('should return a 404', async () => {
        const { body, statusCode } = await supertest(app).get(`/api/pizza`);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockPizzaService = () =>
        jest.spyOn(pizzaService, 'getAllPizzas').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return a 500 error', async () => {
        const pizzaServiceMock = mockPizzaService();
        const { statusCode } = await supertest(app).get(`/api/pizza`);
        expect(statusCode).toBe(500);
        expect(pizzaServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetPizza route
  // ----------------------------------------------------------------
  describe('get pizza route', () => {
    const mockPizza = async () => {
      const pizza = await pizzaService.createPizza(mockedPizza);
      return pizza.toObject();
    };

    describe('given the pizza does exist', () => {
      it('should return a 200 and the pizza', async () => {
        const pizza = await mockPizza();
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizza.id}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual(pizza);
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
      });
    });

    describe('given the pizza does not exist', () => {
      it('should return a 404', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizza not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockPizzaService = () =>
        jest.spyOn(pizzaService, 'getPizzaById').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return a 500 error', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = '6473dcfab93afd651b171a56';
        const { statusCode } = await supertest(app).get(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(500);
        expect(pizzaServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdatePizza route
  // ----------------------------------------------------------------
  describe('update pizza route', () => {
    const mockPizza = async () => {
      const pizza = await pizzaService.createPizza(mockedPizza);
      return pizza.toObject();
    };

    describe('given the pizza is valid', () => {
      it('should return a 200 and the pizza', async () => {
        const pizza = await mockPizza();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizza.id}`)
          .send(mockedPizza);
        expect(statusCode).toBe(200);
        const { id, name, image, price, updatedAt, createdAt } = body;
        expect(id).toEqual(pizza.id);
        expect(name).toEqual(pizza.name);
        expect(image).toEqual(pizza.image);
        expect(price).toEqual(pizza.price);
      });
    });

    describe('given the pizza name is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizza = await mockPizza();
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizza.id}`)
          .send({
            image: mockedPizza.image,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / name] (undefined)');
      });

      it('number: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
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
      });
    });

    describe('given the pizza image is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            price: mockedPizza.price,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / image] (undefined)');
      });

      it('not a string: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
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
      });
    });

    describe('given the pizza price is invalid', () => {
      it('missing: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send({
            name: mockedPizza.name,
            image: mockedPizza.image,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / price] (undefined)');
      });

      it('string: should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
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
      });
    });

    describe('given the pizzaId is invalid', () => {
      it('should return a 422', async () => {
        const pizzaId = '6473dcfab93afd651b171a5';
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
      });
    });

    describe('given the pizza does not exist', () => {
      it('should return a 404 error', async () => {
        const pizzaId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send(mockedPizza);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizza not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockPizzaService = () =>
        jest
          .spyOn(pizzaService, 'updatePizzaById')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });

      it('should return a 500 error', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = '6473dcfab93afd651b171a56';
        const { statusCode } = await supertest(app)
          .put(`/api/pizza/${pizzaId}`)
          .send(mockedPizza);
        expect(statusCode).toBe(500);
        expect(pizzaServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // DeletePizza route
  // ----------------------------------------------------------------
  describe('delete pizza route', () => {
    const mockPizza = async () => {
      const pizza = await pizzaService.createPizza(mockedPizza);
      return pizza.toObject();
    };

    describe('given the deletion was successful', () => {
      it('should return a 200 response with the pizza', async () => {
        const pizza = await mockPizza();
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizza.id}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual({ message: 'Pizza deleted successfully' });
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422 error', async () => {
        const pizzaId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
      });
    });

    describe('given the pizza does not exist', () => {
      it('should return a 404 error', async () => {
        const pizzaId = new mongoose.Types.ObjectId().toHexString();
        const { body, statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizza not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockPizzaService = () =>
        jest
          .spyOn(pizzaService, 'deletePizzaById')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });
      it('should return a 500 error', async () => {
        const pizzaServiceMock = mockPizzaService();
        const pizzaId = new mongoose.Types.ObjectId().toHexString();
        const { statusCode } = await supertest(app).delete(
          `/api/pizza/${pizzaId}`
        );
        expect(statusCode).toBe(500);
        expect(pizzaServiceMock).toBeCalled();
      });
    });
  });
});
