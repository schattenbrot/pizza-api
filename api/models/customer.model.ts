import mongoose from 'mongoose';

export interface ICustomer {
  user?: string;
  contactEmail?: string;
  firstname: string;
  lastname: string;
  phone?: string;
  address: {
    street: string;
    additionalInfo?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomerDocument extends ICustomer, mongoose.Document {}

const AddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
      required: false,
    },
    postalCode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const CustomerSchema = new mongoose.Schema(
  {
    contactEmail: {
      type: String,
      required: false,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    address: AddressSchema,
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

export const Customer = mongoose.model('Customer', CustomerSchema);
