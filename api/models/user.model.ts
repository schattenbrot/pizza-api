import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  email: string;
  password: string;
  avatar?: string;
}

export interface IUserDocument extends IUser, mongoose.Document {}

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
      },
      useProjection: true,
      versionKey: false,
    },
    toObject: {
      transform(doc, ret, options) {
        ret.id = ret._id.toHexString();
        delete ret._id;
        ret.updatedAt = doc.updatedAt.toISOString();
        ret.createdAt = doc.createdAt.toISOString();
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
