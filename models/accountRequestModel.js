const mongoose = require("mongoose");

const accountRequestSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: [true, "role is required"],
            enum: ["organisation", "hospital"],
        },
        name: {
            type: String,
            required: [true, "contact person name is required"],
        },
        organisationName: {
            type: String,
            required: function () {
                return this.role === "organisation";
            },
        },
        hospitalName: {
            type: String,
            required: function () {
                return this.role === "hospital";
            },
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        website: {
            type: String,
        },
        address: {
            type: String,
            required: [true, "address is required"],
        },
        phone: {
            type: String,
            required: [true, "phone number is required"],
            trim: true,
            validate: {
                validator: (value) => /^\d{10}$/.test(String(value).trim()),
                message: "Phone number must be exactly 10 digits",
            },
        },
        proofFile: {
            type: String,
            required: [true, "proof document file is required"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminComments: {
            type: String,
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AccountRequest", accountRequestSchema);
