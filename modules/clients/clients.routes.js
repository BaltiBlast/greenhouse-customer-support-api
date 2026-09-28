import { Router } from "express";
import {
  createClientController,
  deleteClientController,
  getAllClientsController,
  getClientByIdController,
  updateClientController,
} from "./clients.controller.js";

const clientsRouter = Router();

clientsRouter.get("/", getAllClientsController);
clientsRouter.get("/:clientId", getClientByIdController);
clientsRouter.post("/", createClientController);
clientsRouter.patch("/:clientId", updateClientController);
clientsRouter.delete("/:clientId", deleteClientController);

export default clientsRouter;
