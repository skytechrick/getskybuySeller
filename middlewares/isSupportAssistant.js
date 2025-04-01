import { verifyToken } from "../utils/jwt.js";

import supportAssistant from "../models/supportAssistant.js";

export default async ( req , res , next ) => {
    try {

        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({
                status: 'fail',
                message: 'Unauthorized',
            });
        }
        const tokenParts = token.split("Bearer ");
        if (tokenParts.length !== 2) {
            return res.status(401).send({
                status: 'fail',
                message: 'Unauthorized',
            });
        }
        token = tokenParts[1];

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).send({
                status: 'fail',
                message: 'Unauthorized',
            });
        }

        const assistant = await supportAssistant.findOne({ _id: decoded.id });

        if (!assistant) {
            return res.status(401).send({
                status: 'fail',
                message: 'Unauthorized',
            });
        }

        if (assistant.loggedIn.token !== decoded.token) {
            return res.status(401).send({
                status: 'fail',
                message: 'Unauthorized',
            });
        }

        if (assistant.isBan) {
            return res.status(403).send({
                status: 'fail',
                message: 'Your account is banned',
            });
        }

        if (assistant.isVerified === false) {
            return res.status(403).send({
                status: 'fail',
                message: 'Your account is not verified yet',
            });
        }

        req.assistantData = assistant;
        req.role = assistant.role;

        next();

    } catch (error) {
        next(error);
    }
}