import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../../config/app.config';
import { IOrder, PizzaStatus, IOrderDocument } from '../../models/order.model';
import { Pizza, IPizza, IPizzaDocument } from '../../models/pizza.model';
import orderService from '../../services/order.service';
import pizzaService from '../../services/pizza.service';

const mockedPizza: IPizza = {
  image: 'salami.png',
  name: 'Salami',
  price: 6.99,
};

const mockedOrder: IOrder = {
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

const mockPizzas = async () => {
  let pizzas: IPizzaDocument[] = [];

  for (let i = 0; i < 3; i++) {
    const pizza = await pizzaService.createPizza(mockedPizza);
    pizzas.push(pizza.toObject());
  }

  return pizzas;
};

describe('order', () => {
  // ----------------------------------------------------------------
  // CreateOrder route
  // ----------------------------------------------------------------
  describe('create order route', () => {
    describe('given the order is valid', () => {
      it('should return a 201 and the order', async () => {
        const pizzas = await mockPizzas();
        const customer = {
          name: 'customer',
          address: 'address',
        };
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer,
            pizzas: [pizzas[0].id],
          });
        expect(statusCode).toBe(201);
        expect(body.customer).toEqual(customer);
        expect(body.pizzas.length).toBe(1);
        expect(body.pizzas[0].pizza.name).toEqual(pizzas[0].name);
        expect(body.pizzas[0].pizza.image).toEqual(pizzas[0].image);
        expect(body.pizzas[0].pizza.price).toEqual(pizzas[0].price);
        expect(body.pizzas[0].status).toEqual(PizzaStatus.ordered);
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
      });

      it('number: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
      });

      it('number: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
      });
    });

    describe('given pizzas is invalid', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
      });
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
      });

      it('empty: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
      });

      it('not an id: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
      });

      it('pizza id not found: should return a 404 error', async () => {
        const pizzaId = '647146489934164b743e2644';
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
      });
    });

    describe('given an error occurred', () => {
      const mockOrderService = () =>
        jest.spyOn(orderService, 'createOrder').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return a 500', async () => {
        const pizza = Pizza.build(mockedPizza);
        pizza.save();

        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .post(`/api/order`)
          .send({
            customer: mockedOrder.customer,
            pizzas: [pizza.id],
          });
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetAllOrders route
  // ----------------------------------------------------------------
  describe('get all orders route', () => {
    const mockOrders = async () => {
      let orders: IOrderDocument[] = [];

      for (let i = 0; i < 3; i++) {
        const order = await orderService.createOrder(mockedOrder);
        orders.push(order.toObject());
      }

      return orders;
    };

    describe('given orders do exist', () => {
      it('should return a 200 and the orders', async () => {
        const orders = await mockOrders();
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(200);
        expect(body).toEqual(orders);
      });
    });

    describe('given no order does not exist', () => {
      it('should return a 404', async () => {
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Orders not found');
      });
    });

    describe('given an error occurred', () => {
      const mockOrderService = () =>
        jest.spyOn(orderService, 'getAllOrders').mockImplementationOnce(() => {
          throw new Error('error');
        });

      it('should return a 500', async () => {
        const pizza = Pizza.build(mockedPizza);
        pizza.save();

        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app).get(`/api/order`);
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toBeCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // GetOrder route
  // ----------------------------------------------------------------
  describe('get order route', () => {
    const mockOrder = async () => {
      const order = await orderService.createOrder(mockedOrder);
      return order.toObject();
    };

    describe('given the order does exist', () => {
      it('should return a 200 and the order', async () => {
        const order = await mockOrder();
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${order.id}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual(order);
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a5';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockOrderService = () =>
        jest.spyOn(orderService, 'getOrderById').mockImplementationOnce(() => {
          throw new Error('error');
        });
      it('should return a 500', async () => {
        const orderServiceMock = mockOrderService();
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app).get(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdatePizza route
  // ----------------------------------------------------------------
  describe('update order route', () => {
    const mockOrder = async () => {
      const order = await orderService.createOrder(mockedOrder);
      return order.toObject();
    };

    const mockPizza = async () => {
      const pizza = await pizzaService.createPizza(mockedPizza);
      return pizza.toObject();
    };

    describe('given the order is valid', () => {
      it('should return a 200 and the order', async () => {
        const pizza = await mockPizza();
        const order = await mockOrder();
        const updatedOrder = {
          customer: {
            name: 'customer',
            address: 'address',
          },
          pizzas: [pizza.id, pizza.id],
        };
        const updatedPizza = {
          pizza: mockedPizza,
          status: PizzaStatus.ordered,
        };
        order.pizzas = [updatedPizza, updatedPizza];
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${order.id}`)
          .send(updatedOrder);
        expect(statusCode).toBe(200);

        const { id, customer, pizzas, createdAt, updatedAt } = body;
        expect(id).toBe(order.id);
        expect(customer).toEqual(updatedOrder.customer);
        expect(pizzas.length).toBe(2);
        expect(pizzas).toEqual([updatedPizza, updatedPizza]);
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
      });

      it('not a string: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
      });

      it('not a string: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
      });
    });

    describe('given the pizzas is invalid', () => {
      it('missing: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
      });

      it('empty: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
      });

      it('not an id: should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
      });

      it('pizza id not found: should return a 404 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '647146489934164b743e2644';
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422', async () => {
        const orderId = '6473dcfab93afd651b171a5';
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
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const pizza = await mockPizza();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${orderId}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizza.id],
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockOrderService = () =>
        jest
          .spyOn(orderService, 'updateOrderById')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });

      it('should return a 500 error', async () => {
        const order = await mockOrder();
        const pizza = await mockPizza();
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .put(`/api/order/${order.id}`)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizza.id],
          });
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // UpdateOrderedPizzaStatusById route
  // ----------------------------------------------------------------
  describe('update status order route', () => {
    const mockOrder = async () => {
      const order = await orderService.createOrder(mockedOrder);
      return order.toObject();
    };

    const mockPizza = async () => {
      const pizza = await pizzaService.createPizza(mockedPizza);
      return pizza.toObject();
    };

    describe('given the update is valid', () => {
      it('should return a 200 status and the updated order', async () => {
        const order = await mockOrder();
        const index = 0;
        const status = PizzaStatus.oven;
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${order.id}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(200);
        const { id, customer, pizzas, createdAt, updatedAt } = body;
        expect(id).toBe(order.id);
        expect(customer).toEqual(order.customer);
        expect(pizzas.length).toBe(1);
        expect(pizzas[0].status).toEqual(PizzaStatus.oven);
      });
    });

    describe('given the index is invalid', () => {
      it('missing: should return 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const status = PizzaStatus.oven;
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (undefined)');
      });

      it('not a number: should return 422 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 'index';
        const status = PizzaStatus.oven;
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (index)');
      });
    });

    describe('given the status is invalid', () => {
      it('missing: should return 422 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (undefined)');
      });

      it('missing: should return 422 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const status = 'status';
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (status)');
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422 error', async () => {
        const orderId = '6473dcfab93afd651b171a5';
        const index = 0;
        const status = PizzaStatus.oven;
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
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const status = PizzaStatus.oven;
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockOrderService = () =>
        jest
          .spyOn(orderService, 'updateOrderedPizzaStatusById')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });
      it('should return a 500 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService();
        const { body, statusCode } = await supertest(app)
          .patch(`/api/order/${orderId}/status`)
          .send({
            index,
            status,
          });
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId, index, status);
      });
    });
  });

  // ----------------------------------------------------------------
  // DeleteOrder route
  // ----------------------------------------------------------------
  describe('delete order route', () => {
    const mockOrder = async () => {
      const order = await orderService.createOrder(mockedOrder);
      return order.toObject();
    };

    describe('given the deletion was successful', () => {
      it('should return a 200 response with the order', async () => {
        const order = await mockOrder();
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${order.id}`
        );
        expect(statusCode).toBe(200);
        expect(body).toEqual({ message: 'Order deleted successfully' });
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422 error', async () => {
        const orderId = '64772682628695a97466b37';
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (64772682628695a97466b37)'
        );
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
      });
    });

    describe('given an internal server error occurred', () => {
      const mockOrderService = () =>
        jest
          .spyOn(orderService, 'deleteOrderById')
          .mockImplementationOnce(() => {
            throw new Error('error');
          });
      it('should return a 500', async () => {
        const orderServiceMock = mockOrderService();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const { body, statusCode } = await supertest(app).delete(
          `/api/order/${orderId}`
        );
        expect(statusCode).toBe(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });
  });
});
