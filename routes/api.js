import { Router } from 'express';
const api = Router();
export default api;

import authRouter from './authRouter.js';
import productRouter from './productRouter.js';
import onboardingRouter from './onboardingRouter.js';
import isOnboarder from '../middlewares/isOnboarder.js';
import isSeller from '../middlewares/isSeller.js';

api.use("/auth", authRouter);
api.use("/onboarding", isOnboarder , onboardingRouter);
api.use("/product", isSeller , productRouter);