import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import serverless from 'serverless-http';
import apiRouter from '../../server/routes/api.ts';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRouter);

export const handler = serverless(app);
