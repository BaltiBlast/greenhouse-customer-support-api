import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["coaching", "group-class"],
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required() {
        return this.type === "coaching";
      },
    },
    className: {
      type: String,
      trim: true,
      required() {
        return this.type === "group-class";
      },
    },
  },
  {
    timestamps: true,
  },
);

export default eventSchema;
