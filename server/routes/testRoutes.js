import express from "express";

const router = express.Router();

router.get("/ping", (req, res) => {
    res.json({
        success: true,
        message: "API is working!",
    });
});

router.get("/error-test", (req, res, next) => {
    const error = new Error("This is a test error");
    next(error);
});

export default router;
