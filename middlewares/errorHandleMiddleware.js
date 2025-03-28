import fs from 'fs/promises';
import path from 'path';

const errorLog = async (error, req = null) => {
    try {
        const folderPath = path.join(process.cwd(), 'logs'); 
        const filePath = path.join(folderPath, 'error.log');

        await fs.mkdir(folderPath, { recursive: true });

        const timestamp = new Date().toISOString();
        let errorMessage = `ERROR at ${timestamp}\n`;
        if (req) {
            errorMessage += `Endpoint: ${req.method} ${req.url}\n`;
        }
        errorMessage += `Message: ${error.message || 'Unknown error'}\n`;
        errorMessage += `Stack:\n${error.stack || 'No stack trace available'}\n\n`;

        await fs.appendFile(filePath, errorMessage, 'utf8');

    } catch (logError) {
        console.error("Failed to log error:", logError);
    }
};

export default async ( err , req , res , next ) => {

    await errorLog(err, req);
    
    return res.status(500).send({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
}