import { Router } from 'express';
const authRouter = Router();
export default authRouter;

import { signup , signupVerifyOtp , onboardingLogin } from '../controllers/authController.js';

authRouter.post("/signup", signup )
authRouter.post("/signup-verify-otp", signupVerifyOtp )
authRouter.post("/onboarding/login" , onboardingLogin )
// authRouter.post("/login", )
// authRouter.post("/login-verify-otp", )