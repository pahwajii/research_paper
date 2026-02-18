import mongoose from "mongoose";

export const connectDb = async (mongoUri: string): Promise<void> => {
  const connection = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
};
