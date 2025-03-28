import { newSignupSchema } from "../utils/zodSchema.js";
import newSellerModel from "../models/newSeller.js";
import { hashPassword } from "../utils/password.js";
import supportOfficeModel from "../models/supportOffice.js";
import { sendEmail } from "../utils/sendMail.js";
import { createToken } from "../utils/jwt.js";
import crypto from "crypto";

export const signup = async ( req , res , next ) => {
    try {

        const validatedData = newSignupSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                status: "error",
                message: validatedData.error.issues.map(issue => issue.message).join(", "),
            });
        }

        let { pinCode , email, password, name , mobileNumber } = validatedData.data;

        pinCode = parseInt(pinCode, 10);

        const isExist = await newSellerModel.findOne({
            email: email,
        }).exec();

        if (isExist) {
            return res.status(409).json({
                status: "error",
                message: `Account already exists, login with your credentials into the ${isExist.isCompletedOnboarding? "Sellers":"Onboarding"} account.`,
            });
        }

        const allSupportOffices = await supportOfficeModel.find({})
            .select("pinCodes _id")
            .lean()
            .exec();
        
        const supportOffice = allSupportOffices.find(item => item.pinCodes.includes(pinCode));

        const supportOfficeId = supportOffice ? supportOffice._id : undefined;
        

        const hashedPassword = await hashPassword(password);

        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        const token = crypto.randomBytes(32).toString("hex");

        const newSeller = new newSellerModel({
            personalDetails: {
                name,
                mobileNumber,
            },
            authentication: {
                otp,
                otpExpiry,
                token,
            },
            email,
            pinCode,
            supportOffice: supportOfficeId,
            password: hashedPassword,
        });

        const jwtToken = createToken({
            id: newSeller._id,
            token: token,
            isOtp : true,
        });

        const isSent = sendEmail({
            name: "New Seller",
            to: email,
            subject: "Onboarding Account Verification | New seller",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        });

        if (!isSent) {
            return res.status(500).json({
                status: "error",
                message: "Unable to send OTP. Please try again.",
            });
        }

        await newSeller.save();

        return res.status(201).json({
            status: "success",
            message: `Onboarding account created successfully, ${supportOfficeId? "Support office assigned successfully" : "Support office not assigned"} and OTP sent to your email`,
            token: jwtToken,
        });

    } catch (error) {
        next(error);
    }
}