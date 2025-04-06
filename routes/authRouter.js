import { Router } from 'express';
const authRouter = Router();
export default authRouter;

import { register , verifyOtp , onboardingLogin , login , loginVerifyOtp } from '../controllers/authController.js';

authRouter.post("/register", register );
authRouter.post("/verify-otp", verifyOtp );
authRouter.post("/onboarding/login" , onboardingLogin );
authRouter.post("/login" , login );
authRouter.post("/login-verify-otp" , loginVerifyOtp);