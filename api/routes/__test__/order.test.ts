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
          .post(`/api/orders`)
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
          .post(`/api/orders`)
          .send({ ...mockedOrder, customer: { address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
      });

      it('number: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/orders`)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/orders`)
          .send({ ...mockedOrder, customer: { name: 'name' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
      });

      it('number: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/orders`)
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
          .post(`/api/orders`)
          .send({ customer: { name: 'name', address: 'address' } });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
      });

      it('empty: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/orders`)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] });
        expect(statusCode).toBe(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
      });

      it('not an id: should return a 422', async () => {
        const { body, statusCode } = await supertest(app)
          .post(`/api/orders`)
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
          .post(`/api/orders`)
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
          .post(`/api/orders`)
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
      const pizza = await Pizza.create(mockedPizza);

      for (let i = 0; i < 3; i++) {
        const { body: order } = await supertest(app)
          .post('/api/orders')
          .send({
            customer: mockedOrder.customer,
            pizzas: [pizza.id],
          })
          .expect(201);
        orders.push(order);
      }

      return orders;
    };

    describe('given orders do exist', () => {
      it('should return a 200 and the orders', async () => {
        const { cookie } = await signup();
        const orders = await mockOrders();
        const { body } = await supertest(app)
          .get(`/api/orders`)
          .set('Cookie', cookie)
          .expect(200);
        expect(body).toEqual(orders);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const { body } = await supertest(app).get(`/api/orders`).expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given no order does not exist', () => {
      it('should return a 404', async () => {
        const { cookie } = await signup();
        const { body } = await supertest(app)
          .get(`/api/orders`)
          .set('Cookie', cookie)
          .expect(404);
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
        const { cookie } = await signup();
        const pizza = Pizza.build(mockedPizza);
        pizza.save();

        const orderServiceMock = mockOrderService();
        const { body } = await supertest(app)
          .get(`/api/orders`)
          .set('Cookie', cookie)
          .expect(500);
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
      const pizza = await Pizza.create(mockedPizza);
      const { body: order } = await supertest(app)
        .post('/api/orders')
        .send({
          customer: mockedOrder.customer,
          pizzas: [pizza.id],
        })
        .expect(201);
      return order;
    };

    describe('given the order does exist', () => {
      it('should return a 200 and the order', async () => {
        const { cookie } = await signup();
        const order = await mockOrder();
        const { body } = await supertest(app)
          .get(`/api/orders/${order.id}`)
          .set('Cookie', cookie)
          .expect(200);
        expect(body).toEqual(order);
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a5';
        const { body } = await supertest(app)
          .get(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .get(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .expect(404);
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
        const { cookie } = await signup();
        const orderServiceMock = mockOrderService();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .get(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });
  });

  // ----------------------------------------------------------------
  // Update pizza route
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
        const { cookie } = await signup();
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
        const { body } = await supertest(app)
          .put(`/api/orders/${order.id}`)
          .set('Cookie', cookie)
          .send(updatedOrder)
          .expect(200);

        const { id, customer, pizzas, createdAt, updatedAt } = body;
        expect(id).toBe(order.id);
        expect(customer).toEqual(updatedOrder.customer);
        expect(pizzas.length).toBe(2);
        expect(pizzas).toEqual([updatedPizza, updatedPizza]);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .send({ ...mockedOrder, customer: { address: 'address' } })
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the customer name is invalid', () => {
      it('missing: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({ ...mockedOrder, customer: { address: 'address' } })
          .expect(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.name] (undefined)'
        );
      });

      it('not a string: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({ ...mockedOrder, customer: { name: 5, address: 'address' } })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / customer.name] (5)');
      });
    });

    describe('given the customer address is invalid', () => {
      it('missing: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({ ...mockedOrder, customer: { name: 'name' } })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (undefined)'
        );
      });

      it('not a string: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({ ...mockedOrder, customer: { name: 'name', address: 5 } })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid value: [body / customer.address] (5)'
        );
      });
    });

    describe('given the pizzas is invalid', () => {
      it('missing: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({ customer: { name: 'name', address: 'address' } })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] (undefined)');
      });

      it('empty: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({ customer: { name: 'name', address: 'address' }, pizzas: [] })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / pizzas] ()');
      });

      it('not an id: should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: ['nope'],
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid ObjectId: [body / pizzas] (nope)');
      });

      it('pizza id not found: should return a 404 error', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const pizzaId = '647146489934164b743e2644';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({
            customer: { name: 'name', address: 'address' },
            pizzas: [pizzaId],
          })
          .expect(404);
        expect(body.statusCode).toBe(404);
        expect(body.message).toBe('Pizzas not found');
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a5';
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: ['6473ee08fdd01bd77fc1a3d8'],
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const pizza = await mockPizza();
        const { body } = await supertest(app)
          .put(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizza.id],
          })
          .expect(404);
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
        const { cookie } = await signup();
        const order = await mockOrder();
        const pizza = await mockPizza();
        const orderServiceMock = mockOrderService();
        const { body } = await supertest(app)
          .put(`/api/orders/${order.id}`)
          .set('Cookie', cookie)
          .send({
            customer: {
              name: 'customer',
              address: 'address',
            },
            pizzas: [pizza.id],
          })
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------------------------
  // Update OrderedPizza StatusBy Id route
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
        const { cookie } = await signup();
        const order = await mockOrder();
        const index = 0;
        const status = PizzaStatus.oven;
        const { body } = await supertest(app)
          .patch(`/api/orders/${order.id}/status`)
          .set('Cookie', cookie)
          .send({
            index,
            status,
          })
          .expect(200);
        const { id, customer, pizzas, createdAt, updatedAt } = body;
        expect(id).toBe(order.id);
        expect(customer).toEqual(order.customer);
        expect(pizzas.length).toBe(1);
        expect(pizzas[0].status).toEqual(PizzaStatus.oven);
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const orderId = '6473dcfab93afd651b171a56';
        const status = PizzaStatus.oven;
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .send({
            status,
          })
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the index is invalid', () => {
      it('missing: should return 422 error', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a56';
        const status = PizzaStatus.oven;
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            status,
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (undefined)');
      });

      it('not a number: should return 422 error', async () => {
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 'index';
        const status = PizzaStatus.oven;
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            index,
            status,
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / index] (index)');
      });
    });

    describe('given the status is invalid', () => {
      it('missing: should return 422 error', async () => {
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            index,
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (undefined)');
      });

      it('missing: should return 422 error', async () => {
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const status = 'status';
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            index,
            status,
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe('Invalid value: [body / status] (status)');
      });
    });

    describe('given the orderId is invalid', () => {
      it('should return a 422 error', async () => {
        const { cookie } = await signup();
        const orderId = '6473dcfab93afd651b171a5';
        const index = 0;
        const status = PizzaStatus.oven;
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            index,
            status,
          })
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (6473dcfab93afd651b171a5)'
        );
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const status = PizzaStatus.oven;
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            index,
            status,
          })
          .expect(404);
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
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const index = 0;
        const status = PizzaStatus.oven;
        const orderServiceMock = mockOrderService();
        const { body } = await supertest(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Cookie', cookie)
          .send({
            index,
            status,
          })
          .expect(500);
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
        const { cookie } = await signup();
        const order = await mockOrder();
        const { body } = await supertest(app)
          .delete(`/api/orders/${order.id}`)
          .set('Cookie', cookie)
          .expect(200);
        expect(body).toEqual({ message: 'Order deleted successfully' });
      });
    });

    describe('given the user is not authorized', () => {
      it('should return a 401', async () => {
        const orderId = '64772682628695a97466b37';
        const { body } = await supertest(app)
          .delete(`/api/orders/${orderId}`)
          .expect(401);
        expect(body.statusCode).toBe(401);
        expect(body.message).toBe('Unauthorized');
      });
    });

    describe('given the provided id is not an ObjectId', () => {
      it('should return a 422 error', async () => {
        const { cookie } = await signup();
        const orderId = '64772682628695a97466b37';
        const { body } = await supertest(app)
          .delete(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .expect(422);
        expect(body.statusCode).toBe(422);
        expect(body.message).toBe(
          'Invalid ObjectId: [params / id] (64772682628695a97466b37)'
        );
      });
    });

    describe('given the order does not exist', () => {
      it('should return a 404 error', async () => {
        const { cookie } = await signup();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .delete(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .expect(404);
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
        const { cookie } = await signup();
        const orderServiceMock = mockOrderService();
        const orderId = new mongoose.Types.ObjectId().toHexString();
        const { body } = await supertest(app)
          .delete(`/api/orders/${orderId}`)
          .set('Cookie', cookie)
          .expect(500);
        expect(body.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(orderServiceMock).toHaveBeenCalledWith(orderId);
      });
    });
  });
});
