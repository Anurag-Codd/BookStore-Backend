import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (file) => {
  const options = {
    resource_type: "image",
    folder: "BookStore",
    overwrite: true,
    use_filename: true,
    unique_filename: false,
  };

  try {
    const result = await cloudinary.uploader.upload(file, options);
    return result;
  } catch (error) {
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error("Failed to delete image from Cloudinary");
  }
};
