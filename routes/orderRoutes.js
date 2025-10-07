import express from "express";
import { checkout, verifyPayment, getOrders } from "../controllers/orderController.js";

const router = express.Router();

// 1️⃣ Create Razorpay order + save order in DB
router.post("/checkout", checkout);

// 2️⃣ Verify Razorpay payment
router.post("/verify", verifyPayment);

// 3️⃣ Get orders
router.get("/", getOrders);           // Get all orders or orders by UUID (visitor)
router.get("/:orderId", getOrders);   // Get single order by ID

export default router;
