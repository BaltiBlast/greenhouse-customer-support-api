import { Router } from "express";
import { requireAuthentication } from "./middlewares/auth.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import clientsRouter from "./modules/clients/clients.routes.js";
import eventsRouter from "./modules/events/events.routes.js";
import measurementsRouter from "./modules/measurements/measurements.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use(
  "/clients/:clientId/measurements",
  requireAuthentication,
  measurementsRouter,
);
router.use("/clients", requireAuthentication, clientsRouter);
router.use("/events", requireAuthentication, eventsRouter);

export default router;
