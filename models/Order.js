import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Link order to visitor/cart
    uuid: { type: String, required: true },

    
    // User info for delivery/payment
    userInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    // Cart items
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],

    totalAmount: { type: Number, required: true },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Razorpay integration fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true, collection: "Orders" }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
