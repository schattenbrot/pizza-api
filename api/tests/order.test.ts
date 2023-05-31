import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';
import app from '../utils/express';
import {
  DATABASE_NAME,
  DATABASE_PORT,
  DATABASE_PROTOCOL,
  DATABASE_URL,
} from '../utils/environment';
import orderService from '../services/order';
import pizzaService from '../services/pizza';
import { Order, PizzaStatus } from '../models/order';
import PizzaModel, { PizzaSchema } from '../models/pizza';

const mockedPizza = {
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

beforeEach(async () => {
  await mongoose.connect(
    `${DATABASE_PROTOCOL}://${DATABASE_URL}:${DATABASE_PORT}/${DATABASE_NAME}`
  );
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
    describe('given the order is valid', () => {
      it('should return a 201 and the order', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
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
        expect(body).toEqual(mockedOrder);
        expect(createOrderServiceMock).toHaveBeenCalledWith(mockedOrder);
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('number: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given pizzas is invalid', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });
      it('missing: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('empty: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('not an id: should return a 422', async () => {
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('pizza id not found: should return a 404 error', async () => {
        const pizzaId = '647146489934164b743e2644';
        const createOrderServiceMock = jest
          .spyOn(orderService, 'createOrder')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const createPizzaServiceMock = jest
          .spyOn(pizzaService, 'getPizzaById')
          // @ts-ignore
          .mockReturnValueOnce(null);
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
        expect(createPizzaServiceMock).toHaveBeenCalledWith(pizzaId);
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given an error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const createPizzaServiceMock = jest
          .spyOn(pizzaService, 'getPizzaById')
          // @ts-ignore
          .mockReturnValueOnce(mockedPizza);
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
        expect(createPizzaServiceMock).toHaveBeenCalledWith(
          '6473ee08fdd01bd77fc1a3d8'
        );
      });
    });
  });

  // ----------------------------------------------------------------
  // GetAllOrders route
  // ----------------------------------------------------------------
  describe('get all orders route', () => {
    describe('given orders do exist', () => {
      it('should return a 200 and the orders', async () => {
        const getAllOrdersServiceMock = jest
          .spyOn(orderService, 'getAllOrders')
          // @ts-ignore
          .mockReturnValueOnce([mockedOrder]);
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(200);
        expect(body).toEqual([mockedOrder]);
        expect(getAllOrdersServiceMock).toHaveBeenCalled();
      });
    });

    describe('given no order does not exist', () => {
      it('should return a 404', async () => {
        const getAllOrdersServiceMock = jest
          .spyOn(orderService, 'getAllOrders')
          // @ts-ignore
          .mockReturnValueOnce([]);
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Orders not found');
        expect(getAllOrdersServiceMock).toHaveBeenCalled();
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const getAllOrdersServiceMock = jest.spyOn(
          orderService,
          'getAllOrders'
        );
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('InternalServerError');
        expect(getAllOrdersServiceMock).toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetOrder route
  // ----------------------------------------------------------------
  describe('get order route', () => {
    describe('given the order does exist', () => {
      it('should return a 200 and the order', async () => {
        const getOrderServiceMock = jest
          .spyOn(orderService, 'getOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual(mockedOrder);
        expect(getOrderServiceMock).toHaveBeenCalledWith(
          '6473dcfab93afd651b171a56'
        );
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422', async () => {
        const getOrderServiceMock = jest
          .spyOn(orderService, 'getOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const orderId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(getOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404', async () => {
        const getOrderServiceMock = jest
          .spyOn(orderService, 'getOrderById')
          // @ts-ignore
          .mockReturnValueOnce(null);
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(getOrderServiceMock).toHaveBeenCalledWith(
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
    describe('given the order is valid', () => {
      it('should return a 200 and the order', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: ['6473ee08fdd01bd77fc1a3d8'],
          });
        expect(statusCode).toBe(200);
        expect(body).toEqual(mockedOrder);
        expect(updateOrderServiceMock).toHaveBeenCalledWith(
          orderId,
          mockedOrder
        );
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest.spyOn(
          orderService,
          'updateOrderById'
        );
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });

      it('not a string: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest.spyOn(
          orderService,
          'updateOrderById'
        );
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest.spyOn(
          orderService,
          'updateOrderById'
        );
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });

      it('not a string: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderById')
          // @ts-ignore
          .mockReturnValueOnce();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the pizzas is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest.spyOn(
          orderService,
          'updateOrderById'
        );
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });

      it('empty: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const createOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('not an id: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const createOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });

      it('pizza id not found: should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '647146489934164b743e2644';
        const createOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const createPizzaServiceMock = jest
          .spyOn(pizzaService, 'getPizzaById')
          // @ts-ignore
          .mockReturnValueOnce(null);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
        expect(createPizzaServiceMock).toHaveBeenCalledWith(pizzaId);
        expect(createOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a5';
        const updateOrderServiceMock = jest.spyOn(
          orderService,
          'updateOrderById'
        );
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
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderById')
          // @ts-ignore
          .mockReturnValueOnce(null);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: ['6473ee08fdd01bd77fc1a3d8'],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(updateOrderServiceMock).toHaveBeenCalledWith(
          orderId,
          mockedOrder
        );
      });
    });

    describe('given an internal server error occurred', () => {
      it('should return a 500 error', async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        const orderId = '6473dcfab93afd651b171a56';
        const createPizzaServiceMock = jest
          .spyOn(pizzaService, 'getPizzaById')
          // @ts-ignore
          .mockReturnValueOnce(mockedPizza);
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
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
        expect(createPizzaServiceMock).toHaveBeenCalledWith(
          '6473ee08fdd01bd77fc1a3d8'
        );
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdateOrderedPizzaStatusById route
  // ----------------------------------------------------------------
  describe('update status order route', () => {
    describe('given the update is valid', () => {
      it('should return a 200 status and the updated order', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = PizzaStatus.oven;
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(200);
        expect(body).toEqual(mockedOrder);
        expect(updateOrderServiceMock).toHaveBeenCalledWith(
          orderId,
          index,
          status
        );
      });
    });

    describe('given the index is invalid', () => {
      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const status = PizzaStatus.oven;
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (undefined)');
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });

      it('not a number: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 'index';
        const status = PizzaStatus.oven;
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (index)');
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the status is invalid', () => {
      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (undefined)');
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });

      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = 'status';
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (status)');
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a5';
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
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
        expect(updateOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const index = 0;
        const status = PizzaStatus.oven;
        const updateOrderServiceMock = jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          // @ts-ignore
          .mockReturnValueOnce(null);
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(updateOrderServiceMock).toHaveBeenCalledWith(
          orderId,
          index,
          status
        );
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
    describe('given the deletion was successful', () => {
      it('should return a 200 response with the order', async () => {
        const deleteOrderServiceMock = jest
          .spyOn(orderService, 'deleteOrderById')
          // @ts-ignore
          .mockReturnValueOnce(mockedOrder);
        const orderId = '6477285145038d3fad1236d3';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual({ message: 'Order deleted successfully' });
        expect(deleteOrderServiceMock).toHaveBeenCalledWith(
          '6477285145038d3fad1236d3'
        );
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422 error', async () => {
        const deleteOrderServiceMock = jest.spyOn(
          orderService,
          'deleteOrderById'
        );
        const orderId = '64772682628695a97466b37';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (64772682628695a97466b37)'
        );
        expect(deleteOrderServiceMock).not.toHaveBeenCalled();
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const deleteOrderServiceMock = jest
          .spyOn(orderService, 'deleteOrderById')
          // @ts-ignore
          .mockReturnValueOnce(null);
        const orderId = '6473dcfab93afd651b171000';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
        expect(deleteOrderServiceMock).toHaveBeenCalledWith(orderId);
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
