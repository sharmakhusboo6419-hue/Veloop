import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose.
 * Falls back gracefully if MONGO_URI is not provided.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    try {
      if (uri) {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 800 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
      }
    } catch {
      console.log('MongoDB: Local database not reachable. Operating in development mode.');
      return false;
    }
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch {
    console.log('MongoDB: Remote cluster not reachable. Operating in development mode.');
    return false;
  }
};
