import cors from "cors";
import express from "express";
import { csrfProtectionMiddleware } from "./middlewares/csrf.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import sessionMiddleware from "./middlewares/session.middleware.js";
import router from "./router.js";

const app = express();
const frontendUrl = process.env.FRONTEND_URL;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json());
app.use(
  cors({
    origin: frontendUrl || (process.env.NODE_ENV === "production" ? false : true),
    credentials: true,
  }),
);
app.use(csrfProtectionMiddleware);
app.use(sessionMiddleware);
app.use("/api", router);
app.use(errorMiddleware);

export default app;
