import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

mailTransporter.verify((error, success) => {
    if (error) {
        console.error("Email server connection failed:", error);
    } else {
        console.log("Email server connected successfully!");
    }
});