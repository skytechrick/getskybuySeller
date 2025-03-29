import { Router } from "express";
const onboardingRouter = Router();
export default onboardingRouter;

import { profileCompletion , onboardingStatus , businessInformation ,
    bankAccountDetails , pickupAddressDetails , accountsDetails ,
    submitOnboarding , 
} from "../controllers/onboardingController.js";
import { uploadProfileImage , uploadBusinessImage } from "../middlewares/upload.js";
import { profileImageProcessMiddleWare , businessImageProcessMiddleWare } from "../middlewares/imageProcessor.js";

onboardingRouter.get("/status", onboardingStatus )
onboardingRouter.post("/process/profile-completion", uploadProfileImage , profileImageProcessMiddleWare , profileCompletion )
onboardingRouter.post("/process/business", uploadBusinessImage , businessImageProcessMiddleWare , businessInformation )
onboardingRouter.post("/process/bank-account", bankAccountDetails )
onboardingRouter.post("/process/pickup-address", pickupAddressDetails )
onboardingRouter.get("/account", accountsDetails )
onboardingRouter.post("/submit", submitOnboarding );
