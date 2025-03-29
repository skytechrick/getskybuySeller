import fs from "fs";
import newSeller from "../models/newSeller.js";
import { profileCompletionSchema , addressSchema } from "../utils/zodSchema.js";

export const onboardingStatus = async ( req , res , next ) => {
    try {
        const { onboarder } = req;
        const newSellerData = await newSeller.findById(onboarder._id).select("status process").exec();

        if (!newSellerData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: "success",
            status: newSellerData.status,
            process: newSellerData.process,
        });
    } catch (error) {
        next(error);
    }
}

export const profileCompletion = async ( req , res , next ) => {
    try {

        const processedImages = req.processedImages || [];
        let fileName = undefined;
        if (processedImages.length !== 0) {
            fileName = processedImages[0].image ? processedImages[0].image : undefined;
        }

        const validatedData = profileCompletionSchema.safeParse(req.body);

        if (!validatedData.success) {
            console.log("validatedData.error", validatedData.error);
            return res.status(400).json({
                status: "failed",
                message: validatedData.error.issues.map((issue) => issue.message).join(", "),
            });
        }

        validatedData.data.address = JSON.parse(validatedData.data.address);

        const addressValidatedData = addressSchema.safeParse(validatedData.data.address);

        if (!addressValidatedData.success) {
            return res.status(400).json({
                status: "failed",
                message: "Address:" + addressValidatedData.error.issues.map((issue) => issue.message).join(", "),
            });
        }

        const { onboarder } = req;

        const newSellerData = await newSeller.findById(onboarder._id);

        if (!newSellerData) {
            return res.status(404).json({
                status:"failed",
                message: "User not found"
            });
        }

        const {
            address,
            altMobileNumber = undefined,
            dob,
            gender
        } = validatedData.data;

        const checkExistingProfileImage = newSellerData.profileImage;

        if (checkExistingProfileImage && fileName) {
            const filePath = `./public/converted-profile-images/${checkExistingProfileImage}`;

            try {

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                return res.status(500).json({
                    status: "failed",
                    message: "Error deleting old profile image",
                });
            };
        }

        if(fileName) {
            newSellerData.profileImage = fileName.toString();
        }        
        newSellerData.process.profileCompletion = true;
        newSellerData.personalDetails.altMobileNumber = altMobileNumber;
        newSellerData.personalDetails.dob = dob;
        newSellerData.personalDetails.gender = gender;
        newSellerData.personalDetails.address = address;

        await newSellerData.save();

        res.status(200).json({
            status: "success",
            message: "Profile completed successfully",
        });

    } catch (error) {
        next(error);
    }
}