import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    baseUnit: {
      type: String,
      enum: ["g", "ml", "piece"],
      required: true,
    },

    minimumStock: {
      type: Number,
      default: 0,
    },

    expiryDate: {
      type: Date,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Inventory", inventorySchema);
