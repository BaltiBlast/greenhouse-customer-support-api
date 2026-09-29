import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    measuredAt: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
    },
    bodyFat: {
      type: Number,
      min: 0,
      max: 100,
    },
    muscleMass: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

measurementSchema.index({ clientId: 1, measuredAt: -1 });

export default measurementSchema;
