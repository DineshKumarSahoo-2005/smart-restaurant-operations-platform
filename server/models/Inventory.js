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

    unit: {
      type: String,
      enum: ["kg", "g", "litre", "ml", "piece"],
      required: true,
    },

    minimumStock: {
      type: Number,
      default: 10,
    },

    expiryDate: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Inventory", inventorySchema);