import express from "express";
import {
  accountVerification,
  changePassword,
  createAccount,
  deleteAccount,
  forgetPassword,
  getMyReviews,
  login,
  logout,
  postBookReview,
  resetPassword,
  updateBookReview,
  UpdateProfile,
} from "../controllers/user.controller";
import { upload } from "../middleware/multerFileHandler";
import { routeProtection } from "../middleware/routeProtection";
const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.post("/register", createAccount);
router.post("/verify/:id", accountVerification);
router.post("/forgot-password", forgetPassword);
router.patch("/reset-password/:token", resetPassword);

router.use(routeProtection);
router.put("/update-profile", upload, UpdateProfile);
router.patch("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);

router.get("my-reviews", getMyReviews);
router.post("post-review", postBookReview);
router.put("update-review", updateBookReview);

export default router;