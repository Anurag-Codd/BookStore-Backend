import mongoose, { disconnect } from "mongoose";

const Schema = mongoose.Schema();

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    shippingAddress: {
      street: String,
      locality: String,
      landmark: String,
      city: String,
      state: String,
      zipcode: Number,
      country: String,
    },
    totalPrice: {
      tax: Number,
      shipping: Number,
      subtotal: Number,
      disconnect: Number,
      total: Number,
    },
    paymentInfo: {
      transectionId: String,
      paymentType: {
        type: String,
        enum: ["credit", "debit", "netbanking", "upi"],
      },
    },
    status: {
      type: String,
      enum: [ "pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
