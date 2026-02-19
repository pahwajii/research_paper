import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.routes";
import papersRouter from "./routes/papers.routes";
import analyticsRouter from "./routes/analytics.routes";

const app = express();
const allowedCorsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .map((origin) => origin.replace(/\/+$/, ""))
  .filter(Boolean);
const allowedCorsMatchers = allowedCorsOrigins.map((originPattern) => {
  if (!originPattern.includes("*")) {
    return originPattern;
  }

  const escaped = originPattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
});

const isOriginAllowed = (requestOrigin: string): boolean => {
  const normalizedRequestOrigin = requestOrigin.replace(/\/+$/, "");
  return allowedCorsMatchers.some((matcher) =>
    typeof matcher === "string" ? matcher === normalizedRequestOrigin : matcher.test(normalizedRequestOrigin)
  );
};

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || allowedCorsMatchers.length === 0 || isOriginAllowed(requestOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "15mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/papers", papersRouter);
app.use("/api/analytics", analyticsRouter);

export default app;
