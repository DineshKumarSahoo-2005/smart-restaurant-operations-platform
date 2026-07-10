import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
      unique: true,
    },

    ingredients: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        unit: {
          type: String,
          enum: ["kg", "g", "litre", "ml", "piece"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Recipe", recipeSchema);