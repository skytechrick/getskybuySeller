import { Router } from "express";
const onboardingRouter = Router();
export default onboardingRouter;

import { profileCompletion , onboardingStatus } from "../controllers/onboardingController.js";
import { uploadProfileImage } from "../middlewares/upload.js";
import { profileImageProcessMiddleWare } from "../middlewares/profileImageProcess.js";

onboardingRouter.get("/status", onboardingStatus )
onboardingRouter.post("/process/profile-completion", uploadProfileImage , profileImageProcessMiddleWare , profileCompletion )
onboardingRouter.post("/process/business", profileCompletion )
