import dotenv from 'dotenv';
dotenv.config(); // MUST be the first thing

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // <-- added
import connectDB from './libs/db.js';
import cartRoutes from './routes/cartRoutes.js'; // <-- added
import orderRoutes from "./routes/orderRoutes.js";

import { generateUuid } from './middlewares/generateUuid.js'; // <-- added

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'https://aayu-nha3.vercel.app',
  'https://aayuyogamrit.com'
];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // allow cookies
}));
app.use(express.json());
app.use(cookieParser()); // <-- needed to read cookies

// Connect to MongoDB
connectDB();

// visitor middlewares 
app.use(generateUuid)

// Routes
app.use('/api/cart', cartRoutes);


app.use("/api/order", orderRoutes);


// Test route
app.get('/', (req, res) => res.send('Backend is running!'));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
