import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true // ensures one cart per visitor
  },
  items: [
    {
      name: { type: String, required: true },      // Product name
      price: { type: Number, required: true },     // Product price
      quantity: { type: Number, required: true },   // Quantity in cart
      size: { type: String, required: false } // e.g. "500g", "1kg"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
