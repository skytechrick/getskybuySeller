import newSeller from "../models/newSeller.js";
import { verifyToken } from "../utils/jwt.js";

export default async ( req , res , next ) => {
    try {

        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            return res.status(401).json({
                status: "failed",
                message: "Unauthorized"
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid token"
            });
        }

        if(decoded.isOnboarding !== true) {
            return res.status(403).json({
                status: "failed",
                message: "Forbidden"
            });
        }

        const userId = decoded.id;

        const newSellerData = await newSeller.findById(userId);

        if (!newSellerData) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }

        if (decoded.token !== newSellerData.loggedIn.token) {
            return res.status(401).json({
                status: "failed",
                message: "Unauthorized"
            });
        }
        
        if(!newSellerData.isVerified ) {
            return res.status(403).json({
                status: "failed",
                message: "Account not verified, login to verify"
            });
        }

        req.onboarder = newSellerData;

        next();

    } catch (error) {
        next(error);
    }
}