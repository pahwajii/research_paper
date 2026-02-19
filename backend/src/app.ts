import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.routes";
import papersRouter from "./routes/papers.routes";
import analyticsRouter from "./routes/analytics.routes";

const app = express();
const allowedCorsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedCorsOrigins.length > 0 ? allowedCorsOrigins : true
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
