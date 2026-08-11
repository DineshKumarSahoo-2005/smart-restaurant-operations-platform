import Joi from "joi";

export const menuSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),

  description: Joi.string().trim().max(500).allow("").default(""),

  category: Joi.string().trim().max(50).required(),

  price: Joi.number().min(1).required(),

  image: Joi.string().allow("").default(""),

  isAvailable: Joi.boolean().default(true),
});
