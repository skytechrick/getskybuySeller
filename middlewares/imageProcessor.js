import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const processImage = async (fileName) => {
    try {
        const inputPath = path.join(process.cwd(), './public/profile-images', fileName);
        const outputFilePath = path.join(process.cwd(), './public/converted-profile-images', `${path.parse(fileName).name}-${Date.now()}-saved.webp`);

        let image = sharp(inputPath);
        const metaData = await image.metadata();
        const maxSize = Math.max(metaData.width, metaData.height, 800);
        const quality = metaData.width * metaData.height > 2000000 ? 85 : 90;

        await image
            .resize({
                width: maxSize,
                height: maxSize,
                fit: 'contain',
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                    alpha: 1
                },
            })
            .flatten({
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                    alpha: 1
                },
            }).toFormat('webp', {
                quality
            }).toFile(outputFilePath)
            
            image = null;
            sharp.cache(false);
        return path.basename(outputFilePath);
    } catch (error) {
        throw error;
    };
};

export const profileImageProcessMiddleWare = async ( req , res , next ) => {
    const processedImages = [];

    try {
        if (!req.files) {
            next();
        };
        
        const files = req.files;
        const imageProcessingPromises = [];

        for (let i = 1; i <= 1; i++) {
            const imageField = `profileImage`;

            if (files[imageField] && files[imageField][0]) {
                const fileName = files[imageField][0].filename;

                imageProcessingPromises.push(
                    processImage(fileName).then((processedImage) => {
                        processedImages.push({
                            field: imageField,
                            image: processedImage,
                        });
                    })
                );
            };
        };

        await Promise.all(imageProcessingPromises);

        for (let i = 1; i <= 1; i++) {
            const imageField = `profileImage`;

            if (files[imageField] && files[imageField][0]) {
                fs.unlinkSync(path.join(process.cwd(), './public/profile-images', files[imageField][0].filename));
            };
        };
        
        req.processedImages = processedImages;
        next();
    } catch (error) {
        // req.isProductImageUploaded = true;
        // req.deleteFiles = req.files;
        // req.convertedImages = processedImages;
        next(error);
    };
};



const processBusinessImages = async (fileName) => {
    try {
        const inputPath = path.join(process.cwd(), './public/business-images', fileName);
        const outputFilePath = path.join(process.cwd(), './public/converted-business-images', `${path.parse(fileName).name}-${Date.now()}-saved.webp`);

        let image = sharp(inputPath);
        const metaData = await image.metadata();
        const maxSize = Math.max(metaData.width, metaData.height, 800);
        const quality = metaData.width * metaData.height > 2000000 ? 90 : 95;

        await image
            .resize({
                width: maxSize,
                height: maxSize,
                fit: 'contain',
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                    alpha: 1
                },
            })
            .flatten({
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                    alpha: 1
                },
            }).toFormat('webp', {
                quality
            }).toFile(outputFilePath)
            
            image = null;
            sharp.cache(false);
        return path.basename(outputFilePath);
    } catch (error) {
        throw error;
    };
};

export const businessImageProcessMiddleWare = async ( req , res , next ) => {
    const processedImages = [];

    try {
        if (!req.files) {
            next();
        };
        
        const files = req.files;
        const imageProcessingPromises = [];

        const keys = ["panFile" , "aadhaarFile" , "shopPhoto" , "businessLogo"];

        for (let i = 0; i < 4; i++) {
            const imageField = keys[i];

            if (files[imageField] && files[imageField][0]) {
                const fileName = files[imageField][0].filename;

                imageProcessingPromises.push(
                    processBusinessImages(fileName).then((processedImage) => {
                        processedImages.push({
                            field: imageField,
                            image: processedImage,
                        });
                    })
                );
            };
        };

        await Promise.all(imageProcessingPromises);

        for (let i = 0; i < 4; i++) {
            const imageField = keys[i];

            if (files[imageField] && files[imageField][0]) {
                fs.unlinkSync(path.join(process.cwd(), './public/business-images', files[imageField][0].filename));
            };
        };
        
        req.processedImages = processedImages;
        next();
    } catch (error) {
        // req.isProductImageUploaded = true;
        // req.deleteFiles = req.files;
        // req.convertedImages = processedImages;
        next(error);
    };
};