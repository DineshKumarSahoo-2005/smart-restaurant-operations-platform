import Joi from "joi";

export const recipeSchema = Joi.object({
  menuItem: Joi.string().required(),

  ingredients: Joi.array()
    .min(1)
    .items(
      Joi.object({
        inventoryItem: Joi.string().required(),

        quantity: Joi.number().positive().required(),

        baseUnit: Joi.string().valid("g", "ml", "piece").required(),
      }),
    )
    .required(),
});
