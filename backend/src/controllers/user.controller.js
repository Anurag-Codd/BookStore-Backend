import User from "../models/user.model";
import { deleteImage, uploadImage } from "../utilities/cloudinaryConfig.js";

export const UpdateProfile = async (req, res) => {
  const userId = req.id;
  const { userData } = req.body;
  const profilePicture = req.file;
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

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("bookStoreUser");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout", error);
    res.status(500).json({ message: "Internal server Error" });
}
};

export const deleteAccount = async (req, res) => {
    const userId = req.id;
    try {
      const user = await User.findByIdAndDelete(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.avatar) {
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await deleteImage(publicId);
      }
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user", error);
      res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
  };
