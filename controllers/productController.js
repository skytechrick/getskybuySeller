import { createProductSchema , updateProductSchema } from "../utils/zodSchema.js";
import { productPricing } from "../utils/productPricing.js";
import product from "../models/product.js";
import category from "../models/category.js";
import subCategory from "../models/subCategory.js";
import fs from "fs";
import path from "path";

const checkYoutubeUrl = videoUrl => {
    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^&\n]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
        return null;
    }
    return videoUrl;
}

const generateUrl = (length = 12) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let url = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        url += characters[randomIndex];
    }
    return url;
};

export const createProduct = async ( req , res , next ) => {
    try {

        const { sellerData } = req;
        const deleteFiles = async () => {
            const images = req.processedImages.map(e=> e.image);

            await Promise.all(
                images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-product-images', e)))
            );
        };

        const validatedData = createProductSchema.safeParse(req.body)

        if (!validatedData.success) {
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: validatedData.error.issue.map((issue) => issue.message).join(", "),
            });
        }

        const productData = validatedData.data;

        let url = generateUrl();
        while(true){
            const isUrlExist = await product.findOne({ url: url });
            if(!isUrlExist){
                break;
            }
            url = generateUrl();
        }

        const specificationTable = JSON.parse(productData.specificationTable);

        
        const vid = JSON.parse(productData.videos);
        
        const vidFinal = [];
        let www = false;
        if( vid.length > 0 ){
            vid.forEach(async video => {
                const a = checkYoutubeUrl(video);
                if(a === null){
                    www = true;
                    return;
                }
                vidFinal.push(a);
            });
        }
        if(www){
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: "Invalid youtube video url!",
            });
        };
        
        const images = req.processedImages.map(e=> e.image);
        await Promise.all(vidFinal);
        
        const media = {
            videos: vidFinal,
            images: images,
        };

        
        const variants = [];
        const variantData = JSON.parse(productData.variants);

        if(variantData.length > 0){
            variantData.forEach(async variant => {

                if(variant.sellerPrice <= 0 || variant.mrp <= 0){
                    await deleteFiles();
                    return res.status(400).json({
                        status: "failed",
                        message: "Price cannot be negative or zero",
                    });
                }

                if(variant.availableQuantity < 0){
                    await deleteFiles();
                    return res.status(400).json({
                        status: "failed",
                        message: "Available quantity cannot be negative.",
                    });
                }

                if(variant.sellerPrice > variant.mrp){
                    await deleteFiles();
                    return res.status(400).json({
                        status: "failed",
                        message: "Seller price cannot be greater than MRP",
                    });
                }

                if(variant.option === ""){
                    await deleteFiles();
                    return res.status(400).json({
                        status: "failed",
                        message: "Option cannot be empty",
                    });
                }

                variants.push({
                    option: variant.option,
                    availableQuantity: variant.availableQuantity,
                    prices: productPricing(variant.prices),
                });
            });
        }

        await Promise.all(variants);

        const searchCategory = await category.findOne({
            _id: productData.category,
        })
        .populate("subCategory")
        .select("subCategory")
        .exec();

        if(!searchCategory){
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: "Category not found",
            });
        }

        const uploadCategory = searchCategory._id;
        const uploadSubCategory = searchCategory.subCategory.find(e => 
            e._id.toString() === productData.subCategory
        );

        if(!uploadSubCategory){
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: "Sub Category not found",
            });
        }

        const isCategoryExist = sellerData.category.find(e => e.toString() === uploadCategory.toString());

        if(!isCategoryExist){
            await deleteFiles();
            return res.status(400).json({
                status: "failed",
                message: "Category not found in seller category",
            });
        }

        const newProduct = {
            url: url,
            title: productData.title,
            description: productData.description,
            keywords: productData.keywords,
            gender: productData.gender,
            ageGroup: productData.ageGroup,
            seller: sellerData._id,
            supportOffice: sellerData.supportOffice,
            specificationTable: specificationTable,
            media: media,
            variants: variants,
            category: uploadCategory,
            subCategory: uploadSubCategory._id,
        };

        const createdNewProduct = new product(newProduct);

        await createdNewProduct.save();

        sellerData.products.push(createdNewProduct._id);
        await sellerData.save();

        return res.status(200).json({
            status: "success",
            message: "Product created successfully",
        });

    } catch (error) {
        const images = req.processedImages.map(e=> e.image);
            
        await Promise.all(
            images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-product-images', e)))
        );
        next(error);
    }
}

export const getAllProducts = async ( req , res , next ) => {
    try {

        const {
            page = 1,
            limit = 10,
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const totalProducts = await product.countDocuments({
            seller: req.sellerData._id,
        });
        const totalPages = Math.ceil(totalProducts / limitNumber);

        const { sellerData } = req;
        const allProducts = await product.find({
            seller: sellerData._id,
        })
        .populate("category subCategory")
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 })
        .exec();

        if(!allProducts){
            return res.status(400).json({
                status: "failed",
                message: "No products found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Products fetched successfully",
            data: allProducts,
            meta: {
                totalProducts: totalProducts,
                totalPages: totalPages,
                currentPage: pageNumber,
                limit: limitNumber,
                more: pageNumber < totalPages,
            },
        });

        
    } catch (error) {
        next(error);
    }
}

export const productSubmit = async ( req , res , next ) => {
    try {

        const { id } = req.params;
        const { sellerData } = req;

        const productData = await product.findOne({
            _id: id,
            seller: sellerData._id,
        })

        if(!productData){
            return res.status(400).json({
                status: "failed",
                message: "Product not found",
            });
        }

        if(productData.isSubmited === true){
            return res.status(400).json({
                status: "failed",
                message: "Product already submitted",
            });
        }

        productData.isSubmited = true;
        await productData.save();
        
        return res.status(200).json({
            status: "success",
            message: "Product submitted for review successfully",
        });
        
    } catch (error) {
        next(error);
    }
}

export const updateProduct = async ( req , res , next ) => {
    try {

        const { sellerData } = req;
        const { id } = req.params;

        const productData = await product.findOne({
            _id: id,
            seller: sellerData._id,
        }).exec();

        if (!productData) {
            return res.status(404).json({
                status: "fail",
                message: "Product not found or already verified",
            });
        }

        const validatedData = updateProductSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                status: "fail",
                message: validatedData.error.issue.map(( issue ) => issue.message ).join(", "),
            });
        }

        const data = validatedData.data;

        let isUpdated = false;
        let updatedData = [];

        if(data.title && data.title !== productData.title) {
            productData.title = data.title;
            isUpdated = true;
            updatedData.push("title");
        }

        if(data.description && data.description !== productData.description) {
            productData.description = data.description;
            isUpdated = true;
            updatedData.push("description");
        }

        if(data.specificationTable && data.specificationTable !== productData.specificationTable) {
            productData.specificationTable = data.specificationTable;
            isUpdated = true;
            updatedData.push("specificationTable");
        }

        if(data.keywords && data.keywords !== productData.keywords) {
            productData.keywords = data.keywords;
            isUpdated = true;
            updatedData.push("keywords");
        }

        if(data.gender && data.gender !== productData.gender) {
            productData.gender = data.gender;
            isUpdated = true;
            updatedData.push("gender");
        }

        if(data.category && data.category !== productData.category) {
            productData.category = data.category;
            isUpdated = true;
            updatedData.push("category");
        }

        if(data.subCategory && data.subCategory !== productData.subCategory) {
            productData.subCategory = data.subCategory;
            isUpdated = true;
            updatedData.push("subCategory");
        }

        if(data.videos && data.videos !== productData.media.videos) {
            productData.media.videos = data.videos;
            isUpdated = true;
            updatedData.push("videos");
        }

        if(isUpdated) {
            productData.isSubmited = true;
            productData.isVerifiedByAssistant = false;
            productData.isAvailable =false;
            
            await productData.save();
        }

        return res.status(200).json({
            status: "success",
            message: "Product updated successfully",
            data: updatedData,
        });

    } catch (error) {
        next(error);
    }
}

export const updateProductImage = async ( req , res , next ) => {
    try {

        const deleteFiles = async () => {
            const images = req.processedImages.map(e=> e.image);

            await Promise.all(
                images.map(e => fs.unlinkSync(path.join(process.cwd(), './public/converted-product-images', e)))
            );
        };

        const { sellerData } = req;
        const { id } = req.params;

        const productData = await product.findOne({
            _id: id,
            seller: sellerData._id,
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
        productData.isSubmited = true;
        productData.isVerifiedByAssistant = false;
        productData.isAvailable = false;
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

export const updateProductDeleteImage = async ( req , res , next ) => {
    try {

        const { sellerData } = req;

        const { id } = req.params;

        const productData = await product.findOne({
            _id: id,
            seller: sellerData._id,
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