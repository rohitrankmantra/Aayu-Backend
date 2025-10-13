import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js"; // ✅ Import Cart model
import dotenv from 'dotenv';
import { sendAdminEmail } from "../middlewares/nodemailer.js";


dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Checkout: create Razorpay order + save order in DB
 */
export const checkout = async (req, res) => {
  try {
    const { userInfo, items } = req.body;
    const uuid = req.cookies?.uuid;
    if (!uuid) {
      return res.status(400).json({ message: "UUID cookie not found" });
    }
    if (!userInfo || !items || !items.length) {
      return res.status(400).json({ message: "User info and items are required" });
    }
    // Calculate total amount in smallest unit (paise)
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100;
    // Create Razorpay order
    const options = {
      amount: totalAmount,
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    // Save order in DB with pending status + UUID
    const order = await Order.create({
      uuid, // link order to visitor
      userInfo,
      items,
      totalAmount: totalAmount / 100, // store in INR
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(200).json({
      message: "Order created",
      order,
      razorpayOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Verify Razorpay payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate signature and compare
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      // Payment verified → update order
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "paid", razorpayPaymentId: razorpay_payment_id },
        { new: true }
      );

      // ✅ Delete the cart for this user after successful payment
      const uuid = req.cookies?.uuid;
      if (uuid) {
        await Cart.findOneAndDelete({ uuid });
      } 
        await sendAdminEmail(order);
      return res.status(200).json({ message: "Payment verified, cart cleared", order });
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all orders or a single order by ID or UUID
 */
export const getOrders = async (req, res) => {
  try {
    const { orderId } = req.params;
    const uuid = req.cookies?.uuid;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.status(200).json(order);
    }

    // If UUID is present, return orders for that visitor
    if (uuid) {
      const orders = await Order.find({ uuid }).sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }

    // Otherwise return all orders (admin)
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
