import mongoose from 'mongoose';
import { envs } from '../../../config/envs';

export class MongoDatabase {
  static async connect(): Promise<void> {
    try {
      await mongoose.connect(envs.MONGO_URL);
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