import express, { Response } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router = express.Router();

router.get(
    "/protected",
    authenticate,
    (req: AuthRequest, res: Response) => {
        res.json({
            message: "You accessed protected route",
            user: req.user,
        });
    }
);

export default router;
