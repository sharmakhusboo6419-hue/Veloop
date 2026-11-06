import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedDatabase } from './seed.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB Database and run seeder
connectDB().then(() => {
  seedDatabase();
});

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'VELoop Rewards Backend API is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handling middleware
app.use(errorHandler);

// Start the Express server
app.listen(PORT, () => {
  console.log(`VELoop Rewards Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
