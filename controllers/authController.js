import { newSignupSchema , loginSchema } from "../utils/zodSchema.js";
import newSellerModel from "../models/newSeller.js";
import seller from "../models/seller.js";
import { hashPassword , comparePassword } from "../utils/password.js";
import supportOfficeModel from "../models/supportOffice.js";
import { sendEmail } from "../utils/sendMail.js";
import { createToken , verifyToken } from "../utils/jwt.js";
import crypto from "crypto";

export const register = async ( req , res , next ) => {
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

export const verifyOtp = async ( req , res , next ) => {
    try {

        let otp = req.body.otp;

        if(!otp) {
            return res.status(400).json({
                status: "error",
                message: "OTP is required",
            });
        }
        
        otp = parseInt(otp, 10);

        const token = req.headers.authorization.split("Bearer ")[1];

        if(!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        const decodedToken = verifyToken(token);

        if(!decodedToken) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        if(decodedToken.isOtp !== true) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        const { id , token: deToken } = decodedToken;

        const newSeller = await newSellerModel.findById(id).exec();

        if(!newSeller) {
            return res.status(404).json({
                status: "error",
                message: "New seller not found",
            });
        }

        if(newSeller.isCompletedOnboarding) {
            return res.status(400).json({
                status: "error",
                message: "New seller already completed onboarding",
            });
        }

        if(newSeller.authentication.token !== deToken) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        if(newSeller.authentication.otpExpiry < Date.now()) {
            return res.status(400).json({
                status: "error",
                message: "OTP expired",
            });
        }

        if(newSeller.authentication.otp === null) {
            return res.status(400).json({
                status: "error",
                message: "OTP not sent",
            });
        }

        if(newSeller.authentication.otp !== otp) {
            return res.status(400).json({
                status: "error",
                message: "Invalid OTP",
            });
        }

        newSeller.authentication = {
            otp: null,
            otpExpiry: null,
            token: null,
        }

        const newToken = crypto.randomBytes(32).toString("hex");

        newSeller.status = "CREATED";
        newSeller.isVerified = true;
        newSeller.loggedIn = {
            token: newToken,
            lastLoggedIn: Date.now(),
            loginAttempts: 0,
        };

        const jwtToken = createToken({
            id: newSeller._id,
            token: newToken,
            isOnboarding: true,
        });

        const isSent = sendEmail({
            name: "Onboarding Seller",
            to: newSeller.email,
            subject: `Onboarding Account Verified | Complete your onboarding process | GET SKY BUY`,
            text: `
                Your onboarding account has been verified successfully.
                Please complete your onboarding process by logging in to your onboarding account.
                Use the following credentials to log in:
                Email: ${newSeller.email}
                Password: Your password is the same as the one you used to sign up.
                If you have any questions or need assistance, please feel free to reach out to us.
                Thank you for choosing GET SKY BUY!
                Best regards,
                GET SKY BUY Team
                GET SKY BUY Support
            `,
        });

        if (!isSent) {
            return res.status(500).json({
                status: "error",
                message: "Unable to send OTP. Please try again.",
            });
        }

        await newSeller.save();

        return res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
            token: jwtToken,
        });
        
    } catch (error) {
        next(error);
    }
}

export const onboardingLogin = async ( req , res , next ) => {
    try {

        const validatedData = loginSchema.safeParse(req.body);
    
        if (!validatedData.success) {
            return res.status(400).json({
                status: "error",
                message: validatedData.error.issues.map(issue => issue.message).join(", "),
            });
        }

        let { email, password } = validatedData.data;

        const newSeller = await newSellerModel.findOne({
            email: email,
        }).exec();

        if (!newSeller) {
            return res.status(404).json({
                status: "error",
                message: "New seller not found",
            });
        }

        if (newSeller.isCompletedOnboarding) {
            return res.status(400).json({
                status: "error",
                message: "New seller already completed onboarding, login into your seller account",
            });
        }

        if(newSeller.status === "" || newSeller.isVerified === false) {

            const otp = crypto.randomInt(100000, 999999);
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
            const token = crypto.randomBytes(32).toString("hex");

            newSeller.authentication = {
                otp,
                otpExpiry,
                token,
            }

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
                message: `Onboarding account not verified, OTP sent to your email`,
                token: jwtToken,
            });
        }

        if(!await comparePassword(password, newSeller.password)) {
            newSeller.loggedIn.loginAttempts += 1;
            await newSeller.save();
            return res.status(401).json({
                status: "error",
                message: "Invalid password",
            });
        }

        if(newSeller.loggedIn.loginAttempts > 0) {
            newSeller.loggedIn.loginAttempts = 0;
        }

        const token = crypto.randomBytes(32).toString("hex");
        newSeller.loggedIn = {
            token: token,
            lastLoggedIn: Date.now(),
            loginAttempts: 0,
        }

        const jwtToken = createToken({
            id: newSeller._id,
            token: token,
            isOnboarding: true,
        });

        await newSeller.save();
        return res.status(200).json({
            status: "success",
            message: "Login successful",
            token: jwtToken,
        });
        
    } catch (error) {
        next(error);
    }
}

export const login = async ( req , res , next ) => {
    try {

        const validatedData = loginSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                status: "error",
                message: validatedData.error.issues.map(issue => issue.message).join(", "),
            });
        }

        let { email, password } = validatedData.data;

        const existingSeller = await seller.findOne({
            email: email,
        }).exec();
        
        if (!existingSeller) {
            return res.status(404).json({
                status: "error",
                message: "Seller not found",
            });
        }

        if (existingSeller.isBan) {
            return res.status(403).json({
                status: "error",
                message: "Seller account is banned",
            });
        }

        if (!await comparePassword(password, existingSeller.password)) {
            existingSeller.loggedIn.loginAttempts += 1;
            await existingSeller.save();
            return res.status(401).json({
                status: "error",
                message: "Invalid password",
            });
        }
        
        if (existingSeller.isTwoFactorEnabled){
            const otp = crypto.randomInt(100000, 999999);
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
            const token = crypto.randomBytes(32).toString("hex");

            existingSeller.authentication = {
                otp,
                otpExpiry,
                token,
            }

            const jwtToken = createToken({
                id: existingSeller._id,
                token: token,
                isOtp : true,
            });

            const isSent = sendEmail({
                name: "Seller",
                to: email,
                subject: "Login OTP | GET SKY BUY",
                text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            });

            if (!isSent) {
                return res.status(500).json({
                    status: "error",
                    message: "Unable to send OTP. Please try again.",
                });
            }

            await existingSeller.save();

            return res.status(201).json({
                status: "success",
                message: `Login OTP sent to your email`,
                token: jwtToken,
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        existingSeller.loggedIn = {
            token: token,
            lastLoggedIn: Date.now(),
            loginAttempts: 0,
        }
        const jwtToken = createToken({
            id: existingSeller._id,
            token: token,
        });

        await existingSeller.save();

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            token: jwtToken,
        });

    } catch (error) {
        next(error);
    }
}

export const loginVerifyOtp = async ( req , res , next ) => {
    try {

        let otp = req.body.otp;

        if(!otp) {
            return res.status(400).json({
                status: "error",
                message: "OTP is required",
            });
        }
        
        otp = parseInt(otp, 10);

        const token = req.headers.authorization.split("Bearer ")[1];

        if(!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        const decodedToken = verifyToken(token);

        if(!decodedToken) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        if(decodedToken.isOtp !== true) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        const { id , token: deToken } = decodedToken;

        const existingSeller = await seller.findById(id).exec();

        if(!existingSeller) {
            return res.status(404).json({
                status: "error",
                message: "Seller not found",
            });
        }

        if(existingSeller.authentication.token !== deToken) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
        }

        if(existingSeller.authentication.otpExpiry < Date.now()) {
            return res.status(400).json({
                status: "error",
                message: "OTP expired",
            });
        }

        if(existingSeller.authentication.otp === null) {
            return res.status(400).json({
                status: "error",
                message: "OTP not sent",
            });
        }

        if(existingSeller.authentication.otp !== otp) {
            return res.status(400).json({
                status: "error",
                message: "Invalid OTP",
            });
        }

        existingSeller.authentication = {
            otp: null,
            otpExpiry: null,
            token: null,
        }

        const newToken = crypto.randomBytes(32).toString("hex");

        existingSeller.loggedIn = {
            token: newToken,
            lastLoggedIn: Date.now(),
            loginAttempts: 0,
        }

        const jwtToken = createToken({
            id: existingSeller._id,
            token: newToken,
        });

        await existingSeller.save();

        return res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
            token: jwtToken,
        });

    } catch (error) {
        next(error);
    }
}