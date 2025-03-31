import seller from "../models/seller.js";
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

        const userId = decoded.id;

        const sellerData = await seller.findById(userId);

        if (!sellerData) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }

        if (decoded.token !== sellerData.loggedIn.token) {
            return res.status(401).json({
                status: "failed",
                message: "Unauthorized"
            });
        }
        
        if(!sellerData.isVerified ) {
            return res.status(403).json({
                status: "failed",
                message: "Account not verified, login to verify"
            });
        }
        if(sellerData.isBan ) {
            return res.status(403).json({
                status: "failed",
                message: "Account is banned, contact support",
                reason: sellerData.banReason
            });
        }

        req.sellerData = sellerData;

        next();

    } catch (error) {
        next(error);
    }
}