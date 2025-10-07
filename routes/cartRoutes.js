import express from "express";
import {
  addCart,
  getCart,
  removeItem,
  updateCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addCart);
router.put("/update", updateCartItem);
router.get("/get", getCart);
router.delete("/remove", removeItem);

export default router;
