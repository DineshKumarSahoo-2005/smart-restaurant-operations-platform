import Joi from "joi";

export const menuSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().min(1).required(),
  isAvailable: Joi.boolean(),
});
