const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            // Not required for public blood requests from Welcome Page
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
        },
        bloodGroup: {
            type: String,
            required: [true, "Blood group is required"],
            enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
        },
        quantity: {
            type: Number,
        },
        hospitalName: {
            type: String,
        },
        message: {
            type: String,
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        organisation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
        attachment: {
            type: String,
        },
        status: {
            type: String,
            default: "pending",
            enum: ["pending", "approved", "rejected", "fulfilled", "completed"],
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "non-paid"],
            default: "non-paid",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
