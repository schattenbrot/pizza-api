import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpires?: number;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, mongoose.Document {}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         resetToken:
 *           type: string
 *         resetTokenExpires:
 *           type: number
 *         avatar:
 *           type: string
 *           format: url
 *         createdAt:
 *           type: string
 *           form: datetime
 *         updatedAt:
 *           type: string
 *           form: datetime
 *       required:
 *         - email
 *         - password
 *         - avatar
 */

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetToken: {
      type: String,
      required: false,
      select: false,
    },
    resetTokenExpires: {
      type: Number,
      required: false,
      select: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      useProjection: true,
      versionKey: false,
    },
    toObject: {
      transform(doc, ret, options) {
        ret.id = ret._id.toHexString();
        delete ret._id;
        ret.updatedAt = doc.updatedAt && doc.updatedAt.toISOString();
        ret.createdAt = doc.createdAt && doc.createdAt.toISOString();
      },
      useProjection: true,
      versionKey: false,
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model<IUserDocument>('User', UserSchema);
