import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    measurements: {
      type: [
        {
          _id: false,
          measuredAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
          height: {
            type: Number,
            required: true,
            min: 1,
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
      ],
      required: true,
      validate: {
        validator: (measurements) => measurements.length > 0,
        message: "Une mesure initiale est requise.",
      },
    },
    objectives: {
      type: String,
      trim: true,
    },
    pathologies: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    limitations: {
      type: String,
      trim: true,
    },
    hasEatingDisorder: {
      type: Boolean,
      default: false,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default clientSchema;
