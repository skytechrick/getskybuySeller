import mongoose from "mongoose";

const supporOfficeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 255,
        min: 4,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 4,
        lowercase: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branch",
    },
    managers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "support_manager",
    }],
    assistants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "support_assistant",
    }],
    deliveryAgents:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "delivery_agent",
    }],
    sellers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "sellers",
    }],
    pinCodes: [{
        type: Number,
        required: true,
    }],
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
    history: [{
        historyType: {
            type: String,
        },
        relationId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        description: {
            type: String,
            max: 255,
            min: 1,
            default: null,
        },
        date: {
            type: Date,
            default: Date.now(),
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model("support_office" , supporOfficeSchema);