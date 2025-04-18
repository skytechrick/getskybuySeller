import fs from "fs";
import path from "path";
import newSeller from "../models/newSeller.js";
import { profileCompletionSchema , addressSchema , businessInformationSchema ,
        bankAccountDetailsSchema , pickupAddressDetailsSchema
    } from "../utils/zodSchema.js";
import { sendEmail } from "../utils/sendMail.js";

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

        const deleteFile = async () => {
            const images = req.processedImages.map(e=> e.image);
            await Promise.all(
                images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-profile-images', e)))
            );
        };

        const processedImages = req.processedImages || [];
        let fileName = undefined;
        if (processedImages.length !== 0) {
            fileName = processedImages[0].image ? processedImages[0].image : undefined;
        }

        const validatedData = profileCompletionSchema.safeParse(req.body);

        if (!validatedData.success) {
            await deleteFile();
            return res.status(400).json({
                status: "failed",
                message: validatedData.error.issues.map((issue) => issue.message).join(", "),
            });
        }

        validatedData.data.address = JSON.parse(validatedData.data.address);

        const addressValidatedData = addressSchema.safeParse(validatedData.data.address);

        if (!addressValidatedData.success) {
            await deleteFile();
            return res.status(400).json({
                status: "failed",
                message: "Address: " + addressValidatedData.error.issues.map((issue) => issue.message).join(", "),
            });
        }

        const { onboarder } = req;

        const newSellerData = await newSeller.findById(onboarder._id);

        if (!newSellerData) {
            await deleteFile();
            return res.status(404).json({
                status:"failed",
                message: "User not found"
            });
        }

        const {
            altMobileNumber = undefined,
            dob,
            gender,
            name = undefined,
            mobileNumber = undefined,
        } = validatedData.data;

        const checkExistingProfileImage = newSellerData.profileImage;

        if (checkExistingProfileImage && fileName) {
            const filePath = `./public/converted-profile-images/${checkExistingProfileImage}`;

            try {

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                await deleteFile();
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
        newSellerData.personalDetails.dob = new Date(dob);
        newSellerData.personalDetails.gender = gender;
        newSellerData.personalDetails.name = name;
        newSellerData.personalDetails.mobileNumber = mobileNumber;
        newSellerData.address = addressValidatedData.data;

        await newSellerData.save();

        return res.status(200).json({
            status: "success",
            message: "Profile completed successfully",
        });

    } catch (error) {
        const images = req.processedImages.map(e=> e.image);
        await Promise.all(
            images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-profile-images', e)))
        );
        next(error);
    }
}

export const businessInformation = async ( req , res , next ) => {
    try {

        const deleteFiles = async () => {
            const images = req.processedImages.map(e=> e.image);
            
            await Promise.all(
                images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-business-images', e)))
            );
        };

        const validatedData = businessInformationSchema.safeParse(req.body);

        if (!validatedData.success) {
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: validatedData.error.issues.map((issue) => issue.message).join(", "),
            });
        }

        validatedData.data.address = JSON.parse(validatedData.data.address);

        const addressValidatedData = addressSchema.safeParse(validatedData.data.address);
        if (!addressValidatedData.success) {
            console.log(addressValidatedData.error.issues);
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: "Address:" + addressValidatedData.error.issues.map((issue) => issue.message).join(", "),
            });
        }

        const { onboarder } = req;


        const newSellerData = await newSeller.findById(onboarder._id);

        if (!newSellerData) {

            await deleteFiles();
            return res.status(404).json({
                status:"failed",
                message: "User not found"
            });
        }

        if(newSellerData.process.profileCompletion === false){
            await deleteFiles();
            return res.status(400).json({
                status:"failed",
                message: "Please complete your profile first", 
            });
        }

        const processedImages = req.processedImages || [];

        let businessLogo = undefined;
        let shopPhoto = undefined;
        let panFile = undefined;
        let aadhaarFile = undefined;
        if(processedImages.length < 3){
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: "Please upload all required files",
            });
        }

        if (processedImages.length !== 0) {
            processedImages.map((image) => {
                if (image.field === "businessLogo") {
                    businessLogo = image.image;
                } else if (image.field === "shopPhoto") {
                    shopPhoto = image.image;
                } else if (image.field === "panFile") {
                    panFile = image.image;
                } else if (image.field === "aadhaarFile") {
                    aadhaarFile = image.image;
                }
            });
        }

        const checkExistingBusinessLogo = newSellerData.businessInfo.businessLogo;
        const checkExistingShopPhoto = newSellerData.businessInfo.shopPhoto;
        const checkExistingPanFile = newSellerData.businessInfo.panFile;
        const checkExistingAadhaarFile = newSellerData.businessInfo.aadhaarFile;
        if (checkExistingBusinessLogo && businessLogo) {
            const filePath = `./public/converted-business-images/${checkExistingBusinessLogo}`;

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                await deleteFiles();
                return res.status(500).json({
                    status: "failed",
                    message: "Error deleting old business logo",
                });
            };
        }
        if (checkExistingShopPhoto && shopPhoto) {
            const filePath = `./public/converted-business-images/${checkExistingShopPhoto}`;

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                await deleteFiles();
                return res.status(500).json({
                    status: "failed",
                    message: "Error deleting old shop photo",
                });
            };
        }
        if (checkExistingPanFile && panFile) {
            const filePath = `./public/converted-business-images/${checkExistingPanFile}`;

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                await deleteFiles();
                return res.status(500).json({
                    status: "failed",
                    message: "Error deleting old pan file",
                });
            };
        }
        if (checkExistingAadhaarFile && aadhaarFile) {
            const filePath = `./public/converted-business-images/${checkExistingAadhaarFile}`;

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                await deleteFiles();
                return res.status(500).json({
                    status: "failed",
                    message: "Error deleting old aadhaar file",
                });
            };
        }
        if (businessLogo) {
            businessLogo = businessLogo.toString();
        }
        if (shopPhoto) {
            shopPhoto = shopPhoto.toString();
        }
        if (panFile) {
            panFile = panFile.toString();
        }
        if (aadhaarFile) {
            aadhaarFile = aadhaarFile.toString();
        }
        

        const {
            name,
            type,
            gstin = undefined,
            panCard,
            aadhaarCard,
            description,
            businessMobileNumber,
            categories,
        } = validatedData.data;

        newSellerData.categories = categories,
        newSellerData.businessInfo = {
            businessMobileNumber,
            name,
            type,
            description,
            gstin,
            panCard,
            aadhaarCard,
            panFile,
            aadhaarFile,
            businessLogo,
            shopPhoto,
            address: addressValidatedData.data,
        };

        newSellerData.process.businessInformation = true;

        await newSellerData.save();

        res.status(200).json({
            status: "success",
            message: "Business information completed successfully",
        });

    } catch (error) {

        const images = req.processedImages.map(e=> e.image);
        await Promise.all(
            images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-business-images', e)))
        );
            
        next(error);
    }
}

export const bankAccountDetails = async ( req , res , next ) => {
    try {

        const validatedData = bankAccountDetailsSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                status: "failed",
                message: validatedData.error.issues.map((issue) => issue.message).join(", "),
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

        if(newSellerData.process.businessInformation === false){
            return res.status(400).json({
                status:"failed",
                message: "Please complete your business information first", 
            });
        }

        const {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            upi = undefined,
        } = validatedData.data;

        newSellerData.bankAccount = {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            upi,
        };

        newSellerData.process.bankDetailsUploaded = true;

        await newSellerData.save();

        res.status(200).json({
            status: "success",
            message: "Bank account details completed successfully",
        });

    } catch (error) {
        next(error);
    }
}

export const pickupAddressDetails = async ( req , res , next ) => {
    try {

        const validatedData = pickupAddressDetailsSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                status: "failed",
                message: validatedData.error.issues.map((issue) => issue.message).join(", "),
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

        if(newSellerData.process.bankDetailsUploaded === false){
            return res.status(400).json({
                status:"failed",
                message: "Please upload your bank details first", 
            });
        }

        let address = validatedData.data.address;

        if(validatedData.data.isPickupSameAsBusiness === true){
            address = newSellerData.businessInfo.address;
        }

        newSellerData.pickupAddress = {
            contactPerson: {
                name: validatedData.data.contactPerson.name,
                mobileNumber: validatedData.data.contactPerson.mobileNumber,
            },
            ...address,
        };

        newSellerData.process.pickupAddressAdded = true;

        await newSellerData.save();

        res.status(200).json({
            status: "success",
            message: "Pickup address details completed successfully",
        });
        
    } catch (error) {
        next(error);
    }
}

export const accountsDetails = async ( req , res , next ) => {
    try {
        
        const { onboarder } = req;

        const newSellerData = await newSeller.findById(onboarder._id)
            .select("-__v -password -updatedAt -authentication -loggedIn")
            .exec();

        if (!newSellerData) {
            return res.status(404).json({
                status:"failed",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Account details fetched successfully",
            data: newSellerData,
        });

    } catch (error) {
        next(error);
    }
}

export const submitOnboarding = async ( req , res , next ) => {
    try {

        const { onboarder } = req;

        const newSellerData = await newSeller.findById(onboarder._id);

        if (!newSellerData) {
            return res.status(404).json({
                status:"failed",
                message: "User not found"
            });
        }

        const process = newSellerData.process;

        if(
            process.profileCompletion === false ||
            process.businessInformation === false ||
            process.bankDetailsUploaded === false ||
            process.pickupAddressAdded === false
        ){
            return res.status(400).json({
                status:"failed",
                message: "Please complete all the required steps", 
            });
        }

        if(newSellerData.status !== "CREATED"){
            return res.status(400).json({
                status:"failed",
                message: "You have already submitted your onboarding request or it is in process",
            });
        }

        newSellerData.status = "SUBMIT";

        const isSent = await sendEmail({
            to: onboarder.email,
            subject: "Onboarding Request Submitted",
            text: `
                Dear ${onboarder.personalDetails.name},
                
                Your onboarding request has been submitted successfully.
                
                We will review your application and get back to you shortly.
                If you have any questions, feel free to reach out to us.
                Thank you for choosing us!

                Thank you,
                Team
            `,
        });
        
        if (!isSent) {
            return res.status(500).json({
                status: "failed",
                message: "Error sending email",
            });
        }

        await newSellerData.save();

        res.status(200).json({
            status: "success",
            message: "Onboarding request submitted successfully",
        });

    } catch (error) {
        next(error);
    }
}