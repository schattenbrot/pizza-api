import mongoose from 'mongoose';
import { IPizza } from './pizza.model';

export enum PizzaStatus {
  ordered,
  oven,
  ready,
  delivering,
  done,
}

export interface IOrder {
  customer: {
    name: string;
    address: string;
  };
  pizzas: {
    pizza: IPizza;
    status: PizzaStatus;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, mongoose.Document {}

interface IOrderModel extends mongoose.Model<IOrderDocument> {
  build(args: IOrder): IOrderDocument;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderedPizza:
 *       type: object
 *       properties:
 *         pizza:
 *           $ref: '#/components/schemas/Pizza'
 *         status:
 *           type: string
 *           enum:
 *             - ordered
 *             - oven
 *             - ready
 *             - delivering
 *             - done
 *           description: The status of the ordered pizza.
 *         createdAt:
 *           type: string
 *           form: datetime
 *         updatedAt:
 *           type: string
 *           form: datetime
 */
const OrderedPizza = new mongoose.Schema(
  {
    pizza: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
    status: {
      type: Number,
      enum: PizzaStatus,
    },
  },
  {
    _id: false,
  }
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the order.
 *           format: ObjectId
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the customer.
 *             address:
 *               type: string
 *               description: The address of the customer.
 *         pizzas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderedPizza'
 *       required:
 *         - customer
 */
const OrderSchema = new mongoose.Schema<IOrderDocument>(
  {
    customer: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
    },
    pizzas: [OrderedPizza],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
    toObject: {
      transform(doc, ret, options) {
        ret.id = ret._id.toHexString();
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

// OrderSchema.statics.build = (args: IOrder) => {
//   return new Order(args);
// };

export const Order = mongoose.model<IOrderDocument, IOrderModel>(
  'Order',
  OrderSchema
);
