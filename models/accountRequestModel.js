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
    },
    { timestamps: true }
);

module.exports = mongoose.model("AccountRequest", accountRequestSchema);
