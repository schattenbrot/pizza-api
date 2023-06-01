import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';
import app from '../utils/express';
import orderService from '../services/order';
import pizzaService from '../services/pizza';
import OrderModel, { Order, PizzaStatus } from '../models/order';
import PizzaModel, { Pizza, PizzaSchema } from '../models/pizza';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mockedPizza: Pizza = {
  _id: '6473ee08fdd01bd77fc1a3d8',
  image: 'salami.png',
  name: 'Salami',
  price: 6.99,
};

const mockedOrder: Order = {
  customer: {
    name: 'customer',
    address: 'address',
  },
  pizzas: [
    {
      pizza: mockedPizza,
      status: PizzaStatus.ordered,
    },
  ],
};

const mockGetPizzaById = (mock: Pizza | null = mockedPizza) =>
  jest
    .spyOn(pizzaService, 'getPizzaById')
    .mockImplementationOnce((pizzaId: string) => {
      return new Promise((resolve, _reject) => {
        resolve(mock ? new PizzaModel(mock) : null);
      });
    });

beforeEach(async () => {
  const mongodb = await MongoMemoryServer.create();
  await mongoose.connect(mongodb.getUri());
});
afterEach(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe('order', () => {
  // ----------------------------------------------------------------
  // CreateOrder route
  // ----------------------------------------------------------------
  describe('create order route', () => {
    const mockOrderService = () =>
      jest
        .spyOn(orderService, 'createOrder')
        .mockImplementationOnce((order: Order) => {
          return new Promise((resolve, _reject) => {
            resolve(new OrderModel(order));
          });
        });

    describe('given the order is valid', () => {
      it('should return a 201 and the order', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: ['6473ee08fdd01bd77fc1a3d8'],
          });
        expect(statusCode).toBe(201);
        delete body._id;
        body.pizzas.forEach((element: any) => {
          delete element._id;
        });
        expect(body).toEqual(mockedOrder);
        expect(orderServiceMock).toHaveBeenCalledWith(mockedOrder);
        expect(getPizzaByIdServiceMock).toHaveBeenCalledWith(
          '6473ee08fdd01bd77fc1a3d8'
        );
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given pizzas is invalid', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });
      it('missing: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });

      it('empty: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });

      it('not an id: should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).not.toHaveBeenCalled();
      });

      it('pizza id not found: should return a 404 error', async () => {
        const pizzaId = '647146489934164b743e2644';
        const orderServiceMock = mockOrderService();
        const getPizzaByIdServiceMock = mockGetPizzaById(null);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
        expect(orderServiceMock).not.toHaveBeenCalled();
        expect(getPizzaByIdServiceMock).toHaveBeenCalledWith(pizzaId);
      });
    });

    describe('given an error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const getPizzaByIdServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: ['6473ee08fdd01bd77fc1a3d8'],
          });
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(getPizzaByIdServiceMock).toHaveBeenCalledWith(
          '6473ee08fdd01bd77fc1a3d8'
        );
      });
    });
  });

  // // ----------------------------------------------------------------
  // // GetAllOrders route
  // // ----------------------------------------------------------------
  describe('get all orders route', () => {
    const mockOrderService = (isEmpty: boolean = false) =>
      jest.spyOn(orderService, 'getAllOrders').mockImplementationOnce(() => {
        return new Promise(resolve => {
          resolve(isEmpty ? [] : [new OrderModel(mockedOrder)]);
        });
      });

    describe('given orders do exist', () => {
      it('should return a 200 and the orders', async () => {
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(200);
        body.forEach((element: Order) => {
          delete element._id;
          element.pizzas.forEach((element: any) => {
            delete element._id;
          });
        });
        expect(body).toEqual([mockedOrder]);
        expect(orderServiceMock).toHaveBeenCalled();
      });
    });

    describe('given no order does not exist', () => {
      it('should return a 404', async () => {
        const orderServiceMock = mockOrderService(true);
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Orders not found');
        expect(orderServiceMock).toHaveBeenCalled();
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const orderServiceMock = jest.spyOn(orderService, 'getAllOrders');
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(orderServiceMock).toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetOrder route
  // ----------------------------------------------------------------
  describe('get order route', () => {
    const mockOrderService = (mock: Order | null = mockedOrder) =>
      jest
        .spyOn(orderService, 'getOrderById')
        .mockImplementationOnce((orderId: string) => {
          return new Promise(resolve => {
            resolve(mock ? new OrderModel(mock) : null);
          });
        });

    describe('given the order does exist', () => {
      it('should return a 200 and the order', async () => {
        const orderServiceMock = mockOrderService();
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(200);
        delete body._id;
        body.pizzas.forEach((element: any) => {
          delete element._id;
        });
        expect(body).toEqual(mockedOrder);
        expect(orderServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422', async () => {
        const orderServiceMock = mockOrderService();
        const orderId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404', async () => {
        const orderServiceMock = mockOrderService(null);
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(orderServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const getOrderServiceMock = jest.spyOn(orderService, 'getOrderById');
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(getOrderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdatePizza route
  // ----------------------------------------------------------------
  describe('update order route', () => {
    const mockOrderService = (mock: Order | null = mockedOrder) =>
      jest
        .spyOn(orderService, 'updateOrderById')
        .mockImplementationOnce((orderId: string, order: Order) => {
          return new Promise(resolve => {
            resolve(mock ? new OrderModel(mock) : null);
          });
        });

    describe('given the order is valid', () => {
      it('should return a 200 and the order', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '6473ee08fdd01bd77fc1a3d8';
        const orderServiceMock = mockOrderService();
        const pizzaServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(200);
        delete body._id;
        body.pizzas.forEach((element: any) => {
          delete element._id;
        });
        expect(body).toEqual(mockedOrder);
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId);
        expect(orderServiceMock).toHaveBeenCalledWith(orderId, mockedOrder);
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('not a string: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('not a string: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizzas is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('empty: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('not an id: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('pizza id not found: should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '647146489934164b743e2644';
        const orderServiceMock = mockOrderService();
        const pizzaServiceMock = mockGetPizzaById(null);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId);
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a5';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: ['6473ee08fdd01bd77fc1a3d8'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '6473ee08fdd01bd77fc1a3d8';
        const orderServiceMock = mockOrderService(null);
        const pizzaServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId);
        expect(orderServiceMock).toHaveBeenCalledWith(orderId, mockedOrder);
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500 error', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '6473ee08fdd01bd77fc1a3d8';
        const orderServiceMock = jest.spyOn(orderService, 'updateOrderById');
        const pizzaServiceMock = mockGetPizzaById();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(pizzaServiceMock).toHaveBeenCalledWith(pizzaId);
        expect(orderServiceMock).toHaveBeenCalledWith(orderId, mockedOrder);
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdateOrderedPizzaStatusById route
  // ----------------------------------------------------------------
  describe('update status order route', () => {
    const mockOrderService = (mock: Order | null = mockedOrder) =>
      jest
        .spyOn(orderService, 'updateOrderedPizzaStatusById')
        .mockImplementationOnce(
          (orderId: string, index: number, status: PizzaStatus) => {
            return new Promise((resolve, _reject) => {
              resolve(mock ? new OrderModel(mock) : null);
            });
          }
        );

    describe('given the update is valid', () => {
      it('should return a 200 status and the updated order', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(200);
        delete body._id;
        body.pizzas.forEach((element: any) => {
          delete element._id;
        });
        expect(body).toEqual(mockedOrder);
        expect(orderServiceMock).toHaveBeenCalledWith(orderId, index, status);
      });
    });

    describe('given the index is invalid', () => {
      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (undefined)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('not a number: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 'index';
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (index)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the status is invalid', () => {
      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (undefined)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });

      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = 'status';
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (status)');
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a5';
        const index = 0;
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService(null);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId, index, status);
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500 error', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = PizzaStatus.oven;
        const updateOrderServiceMock = jest.spyOn(
          orderService,
          'updateOrderedPizzaStatusById'
        );
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(updateOrderServiceMock).toHaveBeenCalledWith(
          orderId,
          index,
          status
        );
      });
    });
  });

  // ----------------------------------------------------------------
  // DeleteOrder route
  // ----------------------------------------------------------------
  describe('delete order route', () => {
    const mockOrderService = (mock: Order | null = mockedOrder) =>
      jest
        .spyOn(orderService, 'deleteOrderById')
        .mockImplementationOnce((orderId: string) => {
          return new Promise((resolve, _reject) => {
            resolve(mock ? new OrderModel(mock) : null);
          });
        });

    describe('given the deletion was successful', () => {
      it('should return a 200 response with the order', async () => {
        const orderServiceMock = mockOrderService();
        const orderId = '6477285145038d3fad1236d3';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual({ message: 'Order deleted successfully' });
        expect(orderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422 error', async () => {
        const orderServiceMock = mockOrderService();
        const orderId = '64772682628695a97466b37';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (64772682628695a97466b37)'
        );
        expect(orderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderServiceMock = mockOrderService(null);
        const orderId = '6473dcfab93afd651b171000';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const deleteOrderServiceMock = jest.spyOn(
          orderService,
          'deleteOrderById'
        );
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(deleteOrderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });
  });
});
