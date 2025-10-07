import Cart from "../models/Cart.js";

// 🛒 Add or update cart
export const addCart = async (req, res) => {
  try {
    const uuid = req.cookies?.uuid;
    const { items } = req.body;

    if (!uuid) return res.status(400).json({ message: "UUID cookie not found" });
    if (!items || !items.length) return res.status(400).json({ message: "Items are required" });

    let cart = await Cart.findOne({ uuid });

    if (cart) {
      items.forEach((newItem) => {
        const existing = cart.items.find(
          (i) => i.name === newItem.name && i.size === newItem.size
        );

        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
    } else {
      cart = new Cart({ uuid, items });
    }

    await cart.save();
    return res.status(200).json({ message: "Cart saved successfully", cart });
  } catch (error) {
    console.error("Error saving cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🔄 Update quantity (increment/decrement)
export const updateCartItem = async (req, res) => {
  try {
    const uuid = req.cookies?.uuid;
    const { name, size, action } = req.body;

    if (!uuid) return res.status(400).json({ message: "UUID cookie not found" });
    if (!name || !action)
      return res.status(400).json({ message: "Name and action are required" });

    const cart = await Cart.findOne({ uuid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.name === name);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    if (action === "increment") item.quantity += 1;
    else if (action === "decrement") item.quantity = Math.max(1, item.quantity - 1);

    await cart.save();
    return res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📦 Get cart
export const getCart = async (req, res) => {
  try {
    const uuid = req.cookies?.uuid;
    if (!uuid) return res.status(400).json({ message: "UUID cookie not found" });

    const cart = await Cart.findOne({ uuid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json({ cart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ❌ Remove item
export const removeItem = async (req, res) => {
  try {
    const uuid = req.cookies?.uuid;
    const { name } = req.body;

    if (!uuid) return res.status(400).json({ message: "UUID cookie not found" });
    if (!name) return res.status(400).json({ message: "Name is required" });

    const cart = await Cart.findOne({ uuid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.name !== name);
    await cart.save();

    return res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    console.error("Error removing item:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
