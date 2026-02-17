const accountRequestModel = require("../models/accountRequestModel");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { isValidPhone } = require("../utils/validation");

// Create a new account request
const createAccountRequestController = async (req, res) => {
    try {
        const { email, password, phone, latitude, longitude } = req.body;
        if (latitude !== undefined && latitude !== "") {
            const parsedLatitude = Number(latitude);
            if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
                return res.status(400).send({
                    success: false,
                    message: "Latitude must be between -90 and 90",
                });
            }
            req.body.latitude = parsedLatitude;
        }

        if (longitude !== undefined && longitude !== "") {
            const parsedLongitude = Number(longitude);
            if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
                return res.status(400).send({
                    success: false,
                    message: "Longitude must be between -180 and 180",
                });
            }
            req.body.longitude = parsedLongitude;
        }
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "User already registered",
            });
        }
        // Check if request already pending
        const existingRequest = await accountRequestModel.findOne({
            email,
            status: "pending",
        });
        if (existingRequest) {
            return res.status(200).send({
                success: false,
                message: "Account request already pending",
            });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).send({
                success: false,
                message: "Phone number must be exactly 10 digits",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;

        // Handle file upload
        if (req.file) {
            req.body.proofFile = req.file.path;
        } else {
            return res.status(400).send({
                success: false,
                message: "Proof file is required",
            });
        }

        const accountRequest = new accountRequestModel(req.body);
        await accountRequest.save();

        res.status(201).send({
            success: true,
            message: "Account request submitted successfully. Admin will review it.",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Account Request API",
            error,
        });
    }
};

// Get all requests (Admin)
const getAccountRequestsController = async (req, res) => {
    try {
        const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const escapedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = rawSearch ? new RegExp(escapedSearch, "i") : null;
        const query = {
            status: "pending",
            ...(searchRegex
                ? {
                    $or: [
                        { organisationName: { $regex: searchRegex } },
                        { hospitalName: { $regex: searchRegex } },
                        { name: { $regex: searchRegex } },
                        { email: { $regex: searchRegex } },
                        { phone: { $regex: searchRegex } },
                        { role: { $regex: searchRegex } },
                    ],
                }
                : {}),
        };

        const requests = await accountRequestModel
            .find(query)
            .sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: "Account Requests Fetched",
            requests,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error Fetching Account Requests",
            error,
        });
    }
};

// Update request status (Approve/Reject)
const updateRequestStatusController = async (req, res) => {
    try {
        const { status, adminComments } = req.body;
        const { id } = req.params;

        const request = await accountRequestModel.findById(id);
        if (!request) {
            return res.status(404).send({
                success: false,
                message: "Request not found",
            });
        }

        if (status === "approved") {
            // Create User
            const newUser = new userModel({
                name: request.organisationName || request.hospitalName || request.name,
                email: request.email,
                password: request.password, // Already hashed
                role: request.role,
                organisationName: request.organisationName,
                hospitalName: request.hospitalName,
                website: request.website,
                address: request.address,
                phone: request.phone,
                latitude: request.latitude,
                longitude: request.longitude,
            });
            await newUser.save();
        }

        request.status = status;
        request.adminComments = adminComments;
        await request.save();

        res.status(200).send({
            success: true,
            message: `Request ${status} successfully`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error Updating Request Status",
            error,
        });
    }
};

module.exports = {
    createAccountRequestController,
    getAccountRequestsController,
    updateRequestStatusController,
};
