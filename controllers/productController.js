import { createProductSchema } from "../utils/zodSchema.js";
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
    