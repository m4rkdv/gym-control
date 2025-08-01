import mongoose from 'mongoose';

interface Options {
  mongoUrl: string;
}

export class MongoDatabase {

  static async connect(options: Options): Promise<void> {

    const { mongoUrl } = options;
    try {

      await mongoose.connect(mongoUrl);
      console.log('Connected to MongoDB');

    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}