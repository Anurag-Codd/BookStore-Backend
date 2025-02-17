import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./mailTemplate.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSKEY,
  },
});

console.log(`Email configured: ${process.env.EMAIL}`);

export const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: {
      name: "Authentication",
      address: process.env.EMAIL,
    },
    to: email,
    subject: "Verify your Email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      token
    ),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification mail sent:", info.response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const mailOptions = {
    from: {
      name: "Authentication",
      address: process.env.EMAIL,
    },
    to: email,
    subject: "Reset your Password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset mail sent:", info.response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};
