import { Router } from "express";
import {
  createMeasurementController,
  deleteMeasurementController,
  getAllMeasurementsController,
  getMeasurementByIdController,
  updateMeasurementController,
} from "./measurements.controller.js";

const measurementsRouter = Router({ mergeParams: true });

measurementsRouter.get("/", getAllMeasurementsController);
measurementsRouter.get("/:measurementId", getMeasurementByIdController);
measurementsRouter.post("/", createMeasurementController);
measurementsRouter.patch("/:measurementId", updateMeasurementController);
measurementsRouter.delete("/:measurementId", deleteMeasurementController);

export default measurementsRouter;
