const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["admin", "organisation", "donar", "hospital"],
        },
        name: {
            type: String,
            default: "",
            trim: true,
        },
        organisationName: {
            type: String,
            default: "",
            trim: true,
        },
        hospitalName: {
            type: String,
            default: "",
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        website: {
            type: String,
            default: "",
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (value) => /^\d{10}$/.test(String(value).trim()),
                message: "Phone number must be exactly 10 digits",
            },
        },
        preferredCity: {
            type: String,
            default: "",
            trim: true,
        },
        otpHash: {
            type: String,
            required: true,
        },
        otpExpiresAt: {
            type: Date,
            required: true,
        },
        resendAvailableAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

pendingRegistrationSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("pending_registrations", pendingRegistrationSchema);
