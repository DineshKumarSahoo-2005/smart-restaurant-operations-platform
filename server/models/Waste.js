import mongoose from "mongoose";

const wasteSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Restaurant",

      required: true,
    },

    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Inventory",

      required: true,
    },

    ingredientName: {
      type: String,

      required: true,
    },

    quantity: {
      type: Number,

      required: true,
    },

    baseUnit: {
      type: String,

      required: true,
    },

    reason: {
      type: String,

      required: true,

      enum: [
        "Expired",

        "Overcooked",

        "Spillage",

        "Damaged",

        "Returned",

        "Other",
      ],
    },

    costLoss: {
      type: Number,

      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model(
  "Waste",

  wasteSchema,
);
