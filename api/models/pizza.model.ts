import mongoose from 'mongoose';

export interface IPizza {
  name: string;
  image: string;
  price: number;
}

export interface IPizzaDocument extends IPizza, mongoose.Document {}

interface PizzaModel extends mongoose.Model<IPizzaDocument> {
  build(args: IPizza): IPizzaDocument;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Pizza:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *         price:
 *           type: number
 *         createdAt:
 *           type: string
 *           form: datetime
 *         updatedAt:
 *           type: string
 *           form: datetime
 *       required:
 *         - name
 *         - image
 *         - price
 */

export const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
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
        ret.updatedAt = doc.updatedAt.toISOString();
        ret.createdAt = doc.createdAt.toISOString();
      },
      versionKey: false,
    },
  }
);

pizzaSchema.statics.build = (pizza: IPizza) => {
  return new Pizza(pizza);
};

export const Pizza = mongoose.model<IPizzaDocument, PizzaModel>(
  'Pizza',
  pizzaSchema
);
