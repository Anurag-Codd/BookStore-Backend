import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utilities/nodemailer.js";

export const createAccount = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existeUser = await User.findOne({ email });

    if (existeUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hexCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const user = new User({ username, email, password, token: hexCode });
    await user.save();
    res.status(200).json({ message: "User created successfully" });
    sendVerificationEmail(email, user.token);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const accountVerification = async (req, res) => {
  const { id, token } = req.body;

  if (!id || !token) {
    return res.status(400).json({ message: "not valid data" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.token !== token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.tokenExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }
    user.token = undefined;
    user.isVerified = true;
    user.tokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    sendPasswordResetEmail(
      email,
      `${process.env.CLIENT_URL}/reset-password/${user._id}$${
        Date.now() + 30 * 60 * 1000
      }`
    );
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const userId = id.split("$")[0];
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const time = id.split("$")[1];
    if (time < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    user.password = newPassword;
    await user.save();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.id;
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid old password" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
