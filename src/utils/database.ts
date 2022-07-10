import mongoose, { ConnectOptions } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import log from "./log";

let mongod: MongoMemoryServer;

namespace TestDatabase {
  export const connect = async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions;

    await mongoose.connect(uri, mongooseOpts);
  };

  export const closeDatabase = async () => {
    await clearDatabase();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  };

  const clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  };
}

namespace ProductionDatabase {
  export const connect = async (): Promise<void> => {
    mongoose
      .connect(
        process.env.MONGO_URI as string,
        { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions
      )
      .then(() => {
        log.info("MongoDB Connected");
      })
      .catch((err: Error) => {
        log.error(err.message);
      });
  };
}

export { TestDatabase, ProductionDatabase };
