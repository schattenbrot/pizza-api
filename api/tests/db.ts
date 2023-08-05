import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongodb: MongoMemoryServer;
MongoMemoryServer.create().then(mongo => {
  mongodb = mongo;
});

export const mockMongo = async () => {
  mongodb = await MongoMemoryServer.create();
  await mongoose.connect(mongodb.getUri());
};

export const resetMongo = async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

export const stopMongo = async () => {
  await mongodb.stop();
  await mongoose.connection.close();
};
