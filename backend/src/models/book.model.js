import mongoose from "mongoose";

const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    coverImage: [
      {
        type: String,
        required: true,
        validate: {
          validator: (value) => value.length <= 4,
          message: "You can upload a maximum of 4 images",
        },
      },
    ],
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: String,
        required: true,
      },
    ],
    trending: {
      type: Boolean,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
