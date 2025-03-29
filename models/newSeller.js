import mongoose from "mongoose";

const newSellerSchema = new mongoose.Schema({
    status: {
        type: String,
        default: "",
        enum: ["", "CREATED", "SUBMIT", "REDIRECTED", "FINISHED",
            "REJECTED", "NOT_AVAILABLE"],
    },
    process: {
        profileCompletion: {
            type: Boolean,
            default: false,
        },
        businessInformation: {
            type: Boolean,
            default: false,
        },
        pickupAddressAdded: {
            type: Boolean,
            default: false,
        },
        bankDetailsUploaded: {
            type: Boolean,
            default: false,
        },
        documentsUploaded: {
            type: Boolean,
            default: false,
        }
    },
    personalDetails:{
        name: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        altMobileNumber: {
            type: String,
            default: null
        },
        dob: {
            type: Date,
            default: null,
        },
        gender: {
            type: String,
            default: null,
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
    pinCode: {
        type: Number,
        required: true,
    },
    profileImage: {
        type: String,
        default: null,
    },
    isCompletedOnboarding: {
        type: Boolean,
        default: false,
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
        default: false,
    },
    businessInfo:{
        shopName: {
            type: String,
            required: false,
            max: 255,
            min: 4,
        },
        shopAddress: {
            type: String,
            required: false,
            max: 255,
            min: 4,
        },
        shopContact: {
            type: Number,
            required: false,
        },
    },
    documents:{
        panId:{
            type: String,
            required: false,
        },
        aadhaarId:{
            type: String,
            required: false,
        },
    },
    supportOffice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "support_office",
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    }],
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
    password: {
        required: true,
        type: String,
    },
    bankAccount:{
        bankName: {
            type: String,
            default: null,
        },
        beneficiaryName: {
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
        passbook: {
            type: String,
            default: null,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

const newSeller = mongoose.model("new_seller", newSellerSchema);
export default newSeller;