import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

export async function connectMongo(): Promise<typeof mongoose | null> {
  if (!uri) return null;
  if (mongoose.connection.readyState === 1) return mongoose;
  await mongoose.connect(uri);
  return mongoose;
}
