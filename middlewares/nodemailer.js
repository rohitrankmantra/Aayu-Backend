import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

export const sendAdminEmail = async (order) => {
  const emailBody = `
    <h2>New Order Received</h2>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Customer:</strong> ${order.userInfo.name} (${order.userInfo.email})</p>
    <p><strong>Phone:</strong> ${order.userInfo.phone}</p>
    <p><strong>Address:</strong> ${order.userInfo.address}, ${order.userInfo.city}, ${order.userInfo.country} - ${order.userInfo.postalCode}</p>
    <h3>Items:</h3>
    <ul>
      ${order.items.map(item => `<li>${item.name} - ${item.quantity} × ₹${item.price}</li>`).join("")}
    </ul>
    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
    <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>
  `;

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL, // can be multiple recipients
    subject: `New Order Received - ${order._id}`,
    html: emailBody,
  });
};
