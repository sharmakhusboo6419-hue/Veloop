import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import apiRouter from '../server/routes/api.ts';

mongoose.set('bufferCommands', false);

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
