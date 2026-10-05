import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

let cached = global.__mongooseRail;

if (!cached) {
  cached = global.__mongooseRail = { conn: null, promise: null };
}

export default async function connectDB() {
  if (!uri) {
    throw new Error('MONGODB_URI (or MONGO_URI) is not set in Vercel/host env');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 5,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
