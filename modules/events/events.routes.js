import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  getAllEventsController,
  getEventByIdController,
  updateEventController,
} from "./events.controller.js";

const eventsRouter = Router();

eventsRouter.get("/", getAllEventsController);
eventsRouter.get("/:eventId", getEventByIdController);
eventsRouter.post("/", createEventController);
eventsRouter.patch("/:eventId", updateEventController);
eventsRouter.delete("/:eventId", deleteEventController);

export default eventsRouter;
