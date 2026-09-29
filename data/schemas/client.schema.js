import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    height: {
      type: Number,
      min: 1,
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
