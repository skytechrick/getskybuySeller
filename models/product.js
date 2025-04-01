import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        min: 3,
        max: 255,
    },
    description: {
        type: String,
        required: true,
        min: 3,
        max: 5000,
    },
    variants: [{
        option: {
            type: String,
            required: true,
        },
        availableQuantity: {
            type: Number,
            required: true,
        },        
        prices: {
            mrp: {
                type: Number,
                required: true,
            },
            sellerPrice: {
                type: Number,
                required: true,
            },
            defaultPrice: {
                type: Number,
                required: true,
            },
            deliveryCharge: {
                type: Number,
                default: 0,
            },
            localPrice: {
                type: Number,
                required: true,
            },
            localDeliveryCharge: {
                type: Number,
                default: 0,
            },
        },
    }],
    specificationTable: [[
        {
            type: String,
            required: true,
            min: 3,
            max: 255,
        },
        {
            type: String,
            required: true,
            min: 3,
            max: 1000
        },
    ]],
    keywords: {
        type: String,
        default: "",
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    gsbCoins: {
        type: Number,
        default: 1,
        max: 30,
    },

    isCodAvailable: {
        type: Boolean,
        default: false,
    },
    isReturnable: {
        type: Boolean,
        default: false,
    },
    isExchangeable: {
        type: Boolean,
        default: false,
    },
    isDefaultDelivery: {
        type: Boolean,
        default: false,
    },
    isLocalDelivery: {
        type: Boolean,
        default: false,
    },

    isSubmited: {
        type: Boolean,
        default: false,
    },
    isVerifiedByAssistant: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: false,
    },


    media: {
        images: {
            type: Array,
            default: [],
        },
        videos: {
            type: Array,
            default: [],
        },
    },
    faq: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product_faq",
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product_review",
    }],
    gender: {
        type: String,
        default: "universal",
        enum: ["universal" , "male" , "female"]
    },
    ageGroup: {
        type: String,
        default: "all",
        enum: ["all", "adult", "teen", "child"],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller",
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sub_category",
        required: true,
    },
    supportOffice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "support_office",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const product = mongoose.model("product", productSchema);

export default product;