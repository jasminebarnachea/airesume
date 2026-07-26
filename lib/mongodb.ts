import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careerbridge";
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithMongoose = global as typeof globalThis & { mongooseCache?: Cache };
const cached = globalWithMongoose.mongooseCache || (globalWithMongoose.mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
