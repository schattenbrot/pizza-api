import { model, Schema } from 'mongoose';

export type Pizza = {
  _id?: string;
  name: string;
  image: string;
  price: number;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Pizza:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *         price:
 *           type: number
 *       required:
 *         - name
 *         - image
 *         - price
 */

const pizzaSchema = new Schema({
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
});

export default model('Pizza', pizzaSchema);
