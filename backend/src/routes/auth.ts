import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Company } from "../models/Company";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email,
      isActive: true,
    }).select("+passwordHash");

    console.log(`[LOGIN_DEBUG] Email: "${email}"`);
    console.log(`[LOGIN_DEBUG] User found: ${!!user}`);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let isMatch = await bcrypt.compare(password, user.passwordHash);
    
    // TEMPORARY FALLBACK: Check if password was stored as plain text
    if (!isMatch && password === user.passwordHash) {
      console.log("[LOGIN_DEBUG] Plain text match found! Password was not hashed in DB.");
      isMatch = true;
    }
    
    console.log(`[LOGIN_DEBUG] Final Access Match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        companyId: user.companyId,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error });
  }
});

export default router;
