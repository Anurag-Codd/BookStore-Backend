import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import Book from "../models/book.model.js";
import Review from "../models/rewiew.model.js";
import { deleteImage, uploadImage } from "../utilities/cloudinaryConfig.js";
import {sendPasswordResetEmail,sendVerificationEmail} from "../utilities/nodemailer.js";

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
    sendVerificationEmail(email, user.token);
    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const accountVerification = async (req, res) => {
  const { token } = req.body;
  const { id } = req.params;

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

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
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
      `${process.env.CLIENT_URL}/reset-password/${user._id}$@{
        Date.now() + 30 * 60 * 1000
      }`
    );
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token:id } = req.params;
  const { newPassword } = req.body;
  try {
    const userId = id.split("@")[0];
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
    return res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.userId;
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
    return res.status(500).json({ message: "Server error" });
  }
};

export const UpdateProfile = async (req, res) => {
  const userId = req.userId;
  const { userData } = req.body;
  const profilePicture = req.file.avatar;
  let imageUrl;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (profilePicture) {
      if (user.avatar) {
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await deleteImage(publicId);
      }
      const response = await uploadImage(profilePicture);
      imageUrl = response.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...JSON.parse(userData),
        ...(imageUrl && { avatar: imageUrl }),
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("BStoreUser");
    res.clearCookie("BStoreUserRef");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

export const deleteAccount = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await deleteImage(publicId);
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

export const postBookReview = async (req, res) => {
  const userId = req.userId;
  const { bookId, reviewData } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    const review = await Review.create({
      userId,
      bookId,
      ...reviewData,
    });

    return res
      .status(201)
      .json({ message: "Review added successfully", review });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

export const updateBookReview = async (req, res) => {
  const userId = req.userId;
  const { reviewId, reviewData } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { ...reviewData },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Review updated successfully", updatedReview });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

export const getMyReviews = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const reviews = await Review.find({ userId });

    return res
      .status(200)
      .json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};
