import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import validate from "../middleware/validate.js";

import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register",validate(registerSchema),registerUser);

router.post("/login",validate(loginSchema), loginUser);

export default router;
