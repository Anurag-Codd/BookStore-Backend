import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    avatar: String,
    email: [
      {
        type: String,
        required: true,
        unique: true,
        primary: Boolean,
      },
    ],
    password: {
      type: String,
      required: true,
    },
    phone: [
      {
        type: Number,
        required: true,
        primary: Boolean,
      },
    ],
    address: {
      street: String,
      locality: String,
      landmark: String,
      city: String,
      state: String,
      zipcode: Number,
      country: String,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    token: String,
    tokenExpiresAt: Date.now + 30 * 60 * 1000,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
