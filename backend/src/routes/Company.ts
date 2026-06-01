import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Company } from "../models/Company";
import { User } from "../models/User";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { companyName, companyCode, name, email, password } = req.body;

        const company = await Company.create({
            name: companyName,
            companyCode,
        });


        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            companyId: company._id,
            name,
            email,
            role: "superadmin",
            passwordHash,
        });

        const token = jwt.sign(
            {
                userId: user._id,
                companyId: company._id,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
});

export default router;
