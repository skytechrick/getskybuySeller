import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        default: null,
    },
    personalDetails:{
        name: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        mobileNumber: {
            type: Number,
            default: null
        },
        altMobileNumber: {
            type: Number,
            default: null
        },
        dob: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            required: true,
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 4,
        lowercase: true,
    },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    }],
    pinCode: {
        type: Number,
        required: true,
    },
    isOpen: {
        type: Boolean,
        default: false,
    },
    bankAccount:{
        accountHolderName: {
            type: String,
            default: null,
        },
        bankName: {
            type: String,
            default: null,
        },
        accountNumber: {
            type: Number,
            default: null,
        },
        ifscCode: {
            type: String,
            default: null,
        },
        upi: {
            type: String,
            default: null,
        },
    },
    supportOffice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "support_office",
    },
    products:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
    }],
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
    }],
    onboardingCompletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "regional_officer",
    },
    onboardingCompletedAt: {
        type: Date,
    },
    businessInfo: {
        businessMobileNumber: {
            type: String,
            required: false,
            default: null,
        },
        name: {
            type: String,
            required: false,
            max: 255,
            default: null,
            min: 4,
        },
        type: {
            type: String,
            required: false,
            default: null,
            max: 255,
            min: 4,
        },
        description: {
            type: String,
            required: false,
            default: null,
            max: 500,
            min: 4,
        },
        gstin: {
            type: String,
            required: false,
            default: null,
            max: 15,
            min: 4,
        },
        panCard: {
            type: String,
            required: false,
            default: null,
            max: 10,
            min: 4,
        },
        aadhaarCard: {
            type: String,
            required: false,
            default: null,
            max: 12,
            min: 4,
        },
        panFile: {
            type: String,
            required: false,
            default: null,
        },
        aadhaarFile: {
            type: String,
            required: false,
            default: null,
        },
        businessLogo: {
            type: String,
            required: false,
            default: null,
        },
        shopPhoto: {
            type: String,
            required: false,
            default: null,
        },
        address: {
            address_line: {
                type: String,
                required: false,
                max: 255,
                min: 3,
            },
            pinCode: {
                type: Number,
                required: false,
            },
            district: {
                type: String,
                required: false,
                max: 255,
                min: 3,
            },
            city: {
                type: String,
                required: false,
                max: 255,
                min: 3,
            },
            state: {
                type: String,
                required: false,
                max: 255,
                min: 3,
            },
            country: {
                type: String,
                required: false,
                max: 255,
                min: 3,
            },
        },
    },
    pickupAddress: {
        contactPerson:{
            name: {
                type: String,
                required: false,
                max: 255,
                min: 3,
            },
            mobileNumber: {
                type: String,
                required: false,
                max: 15,
            },
        },
        address_line: {
            type: String,
            required: false,
            max: 255,
            min: 3,
        },
        pinCode: {
            type: Number,
            required: false,
        },
        district: {
            type: String,
            required: false,
            max: 255,
            min: 3,
        },
        city: {
            type: String,
            required: false,
            max: 255,
            min: 3,
        },
        state: {
            type: String,
            required: false,
            max: 255,
            min: 3,
        },
        country: {
            type: String,
            required: false,
            max: 255,
            min: 3,
        },
    },
    address: {
        address_line: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        pinCode: {
            type: Number,
            required: true,
        },
        district: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        city: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        state: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        country: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
    },
    loggedIn:{
        token: {
            type: String,
            default: null,
        },
        lastLoggedIn: {
            type: Date,
            default: null,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
    },
    authentication: {
        otp: {
            type: Number,
            default: null,
        },
        otpExpiry: {
            type: Date,
            default: null,
        },
        token: {
            type: String,
            default: null,
        },
    },
    isBan: {
        type: Boolean,
        default: false,
    },
    banReason: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
    password: {
        required: true,
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    darkMode: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
});

export default mongoose.model("sellers", sellerSchema);