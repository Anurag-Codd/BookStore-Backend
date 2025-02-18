import User from "../models/user.model.js";
import { deleteImage, uploadImage } from "../utilities/Cloudinary.utilities.js";
import Book from "./book.model.js";

export const createBook = async (req, res) => {
  const sellerId = req.userId;
  const { bookData } = req.body;
  const coverImages = req.files.thumbnail || [];

  if (coverImages.length > 4) {
    return res
      .status(400)
      .json({ message: "You can upload a maximum of 4 images" });
  }

  try {
    const imageUploadPromises = coverImages.map((image) =>
      uploadImage(image.path)
    );
    const uploadedImages = await Promise.all(imageUploadPromises);

    const book = new Book({
      ...JSON.parse(bookData),
      coverImage: uploadedImages.map((image) => image.secure_url),
      seller: sellerId,
    });
    await book.save();
    return res.status(200).json({ message: "Book posted successfully", book });
  } catch (error) {
    console.error("Error creating book", error);
    return res
      .status(500)
      .json({ message: "Failed to create book", error: error.message });
  }
};

export const updateBookById = async (req, res) => {
  const { bookData, removeImages } = req.body;
  const coverImages = req.files.thumbnail || [];
  const { id } = req.params;

  if (coverImages.length > 4) {
    return res
      .status(400)
      .json({ message: "You can upload a maximum of 4 images" });
  }

  try {
    const deleteImagePromises = removeImages.map((image) =>
      deleteImage(image.split("/").slice(-2).join("/").split(".")[0])
    );
    await Promise.all(deleteImagePromises);

    const imageUploadPromises = coverImages.map((image) =>
      uploadImage(image.path)
    );
    const uploadedImages = await Promise.all(imageUploadPromises);

    const updatedBookData = {
      ...JSON.parse(bookData),
      coverImage: uploadedImages.map((image) => image.secure_url),
    };

    const updatedBook = await Book.findByIdAndUpdate(id, updatedBookData, {
      new: true,
    });
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found!" });
    }
    return res
      .status(200)
      .json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("Error updating book", error);
    return res
      .status(500)
      .json({ message: "Failed to update book", error: error.message });
  }
};

export const removeBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found!" });
    }

    const deleteImagePromises = deletedBook.coverImage.map((image) =>
      deleteImage(image.split("/").slice(-2).join("/").split(".")[0])
    );
    await Promise.all(deleteImagePromises);

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book", error);
    return res
      .status(500)
      .json({ message: "Failed to delete book", error: error.message });
  }
};

export const analytics = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (user.role === "customer") {
      return res.status(404).json({ message: "unauthorized" });
    }
    const totalbooks = await Book.find({ seller: userId }).countDocuments();
    const soldBooks = await Order.find({ "products.productId": { $in: totalbooks } && { status: "delivered" } }).countDocuments();
    const returnedBooks = await Order.find({ "products.productId": { $in: totalbooks } && { status: "returned" } }).countDocuments();
    const totalEarning = await Order.aggregate([ { $match: { "products.productId": { $in: totalbooks }, status: "delivered" } }, { $unwind: "$products" }, { $match: { "products.productId": { $in: totalbooks } } }, { $group: { _id: null, totalEarnings: { $sum: "$products.price"  } } }
    ]);

    return res.status(200).json({
      analytics: {totalbooks , soldBooks, returnedBooks, totalEarning },
      message: "Analytics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching analytics", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: error.message });
  }
};
