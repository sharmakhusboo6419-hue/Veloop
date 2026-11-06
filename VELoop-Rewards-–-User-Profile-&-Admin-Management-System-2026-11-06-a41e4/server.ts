import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api.ts';
import { seedDatabase } from './server/seed.ts';

dotenv.config();

// Disable Mongoose query buffering to prevent timeouts when offline/unconnected
mongoose.set('bufferCommands', false);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Connect MongoDB if MONGO_URI is configured
  const MONGO_URI = process.env.MONGO_URI;
  if (MONGO_URI && MONGO_URI.trim() !== '' && !MONGO_URI.includes('127.0.0.1') && !MONGO_URI.includes('localhost')) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to MongoDB successfully.');
      await seedDatabase();
    } catch {
      console.log('MongoDB: Remote cluster not reachable. Operating with persistent store.');
    }
  } else if (MONGO_URI && (MONGO_URI.includes('127.0.0.1') || MONGO_URI.includes('localhost'))) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 800 });
      console.log('Connected to local MongoDB successfully.');
      await seedDatabase();
    } catch {
      console.log('MongoDB: Local database not reachable on 127.0.0.1:27017. Operating in development mode.');
    }
  } else {
    console.log('MongoDB: Operating with local development store.');
  }

  // Mount API Router
  app.use('/api', apiRouter);

  // Vite middleware setup for development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite dev middleware mounted.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`VELoop Rewards Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
