import mongoose from "mongoose";
import Client from "./client.mapper.js";
import Event from "./event.mapper.js";
import Measurement from "./measurement.mapper.js";
import User from "./user.mapper.js";

export const ClientMapper = new Client(mongoose);
export const EventMapper = new Event(mongoose);
export const MeasurementMapper = new Measurement(mongoose);
export const UserMapper = new User(mongoose);
