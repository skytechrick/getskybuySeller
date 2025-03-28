import { mailTransporter } from '../config/emailConfig.js';

export const sendEmail = async ({ name , to , subject , text , html , bcc , cc }) => {
    try {
        await mailTransporter.sendMail({
            from: `${name? name: 'Notification'} <${process.env.EMAIL_USER}>`,
            to,
            subject,
            bcc: bcc? bcc : undefined,
            cc: cc? cc : undefined,
            html: html? html : undefined,
            text: text? text : undefined,
        });
        return true;
    } catch (error) {
        return null;
    }
}
