import fs from 'fs';
import path from 'path';
import product from '../models/product.js';

export const uploadUpdateProductImageForSupportAssistant = async ( req , res , next ) => {
    try {

        const deleteFiles = async () => {
            const images = req.processedImages.map(e=> e.image);

            await Promise.all(
                images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-product-images', e)))
            );
        };

        const { assistantData } = req;
        const { id } = req.params;

        const productData = await product.findOne({
            _id: id,
            supportOffice: assistantData.supportOffice,
            isSubmited: true,
            isVerifiedByAssistant: false,
            isAvailable: false,
        }).exec();

        if (!productData) {
            await deleteFiles();
            return res.status(404).json({
                status: "fail",
                message: "Product not found or already verified",
            });
        }
        const images = req.processedImages.map(e=> e.image);

        if(images.length === 0){
            await deleteFiles();
            return res.status(400).json({
                status: "fail",
                message: "No images found",
            });
        }

        if(productData.media.images.length + images.length > 7){
            await deleteFiles();
            return res.status(400).json({
                status: "fail",
                message: "Product cannot have more than 7 images",
            });
        }

        productData.media.images = [...productData.media.images, ...images];
        await productData.save();
        
        return res.status(200).json({
            status: "success",
            message: "Product images updated successfully",
            image: images[0],
        });

        
    } catch (error) {
        next(error);
    }
}

export const deleteProductImageForSupportAssistant = async ( req , res , next ) => {
    try {

        const { assistantData } = req;

        const { id } = req.params;

        const productData = await product.findOne({
            _id: id,
            supportOffice: assistantData.supportOffice,
            isSubmited: true,
            isVerifiedByAssistant: false,
            isAvailable: false,
        }).exec();

        if (!productData) {
            return res.status(404).json({
                status: "fail",
                message: "Product not found or already verified",
            });
        }

        const image = req.body.image;

        if(!image){
            return res.status(400).json({
                status: "fail",
                message: "Image not found",
            });
        }

        if(productData.media.images.length === 1){
            return res.status(400).json({
                status: "fail",
                message: "Product must have at least one image",
            });
        }

        const isExist = productData.media.images.find(e => e === image);

        if(!isExist){
            return res.status(400).json({
                status: "fail",
                message: "Image not found in product",
            });
        }
        productData.media.images = productData.media.images.filter(e => e !== image);
        productData.isSubmited = true;
        productData.isVerifiedByAssistant = false;
        productData.isAvailable = false;
        
        try {
            fs.unlinkSync(path.join(process.cwd(), './public/converted-product-images', image));
        } catch (error) {
            return res.status(500).json({
                status: "fail",
                message: "Unable to delete image, try again",
            });
        }

        await productData.save();
        
        return res.status(200).json({
            status: "success",
            message: "Image deleted successfully",
        });
        
        
    } catch (error) {
        next(error);
    }
}