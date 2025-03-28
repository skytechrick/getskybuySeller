import { Router } from 'express';
const authRouter = Router();
export default authRouter;

import { signup } from '../controllers/authController.js';

authRouter.post("/signup", signup )
// authRouter.post("/onboarding/login", )
// authRouter.post("/login", )
// authRouter.post("/login-verify-otp", )