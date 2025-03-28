import { Router } from 'express';
const api = Router();
export default api;

import authRouter from './authRouter.js';

api.use("/auth", authRouter);