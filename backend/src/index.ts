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

start().catch((error: any) => {
  const errorMessage = error?.message || String(error);
  const isAuthError = 
    errorMessage.includes("authentication failed") || 
    errorMessage.includes("bad auth") || 
    error?.code === 8000;

  if (isAuthError) {
    console.error("\n======================================================================");
    console.error("🔴 DATABASE CONNECTION ERROR: Authentication failed.");
    console.error("======================================================================");
    console.error("This is usually caused by:");
    console.error("1. Incorrect username or password in your MONGODB_URI environment variable.");
    console.error("2. Unencoded special characters (e.g. @, :, /, +, ?, #) in your password.");
    console.error("\n👉 HOW TO FIX IT:");
    console.error("   If your password contains special characters, they MUST be URL-encoded.");
    console.error("   For example, if your password is 'my@pass:word', it should be encoded as:");
    console.error("   - '@'  ->  '%40'");
    console.error("   - ':'  ->  '%3A'");
    console.error("   - '/'  ->  '%2F'");
    console.error("   - '+'  ->  '%2B'");
    console.error("   - '?'  ->  '%3F'");
    console.error("   - '#'  ->  '%23'");
    console.error("\n   Update MONGODB_URI in Render / your environment settings and redeploy.");
    console.error("======================================================================\n");
  }

  console.error("Failed to start backend:", error);
  process.exit(1);
});
