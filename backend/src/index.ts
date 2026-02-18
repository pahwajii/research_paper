import dotenv from "dotenv";
import app from "./app";
import { connectDb } from "./config/db";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required");
}
if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const start = async (): Promise<void> => {
  await connectDb(mongoUri);
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
