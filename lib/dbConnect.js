import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb+srv://railway:railway@cluster0.hdxq0rd.mongodb.net/railway_management?appName=Cluster0';
const uri =
  process.env.MONGODB_URI?.trim() ||
  process.env.MONGO_URI?.trim() ||
  DEFAULT_URI;

let cached = global.__mongooseRail;

if (!cached) {
  cached = global.__mongooseRail = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 5,
      family: 4,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
