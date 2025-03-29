import { Router } from 'express';
const api = Router();
export default api;

import authRouter from './authRouter.js';
import onboardingRouter from './onboardingRouter.js';
import isOnboarder from '../middlewares/isOnboarder.js';

api.use("/auth", authRouter);
api.use("/onboarding", isOnboarder , onboardingRouter);