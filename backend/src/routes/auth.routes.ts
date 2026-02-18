import bcrypt from "bcryptjs";
import { Router } from "express";
import { UserModel } from "../models/user.model";
import { signToken } from "../utils/jwt";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const token = signToken({ userId: String(user._id), email: user.email });
    res.status(201).json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to sign up", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = signToken({ userId: String(user._id), email: user.email });
    res.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error });
  }
});

export default router;
