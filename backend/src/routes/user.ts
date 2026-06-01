import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router = express.Router();

// Create user inside same company (superadmin/admin only)
router.post("/", authenticate, async (req: AuthRequest, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Allow only superadmin or admin
        if (!["superadmin", "admin"].includes(req.user!.role)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const existingUser = await User.findOne({
            companyId: req.user!.companyId,
            email,
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists in company",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            companyId: req.user!.companyId,
            name,
            email,
            role,
            passwordHash,
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "User creation failed", error });
    }
});
// Get logged-in user profile
router.get("/me", authenticate, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user!.userId)
            .select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Extra safety: ensure company match
        if (user.companyId.toString() !== req.user!.companyId) {
            return res.status(403).json({
                message: "Unauthorized access",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
});

export default router;
