const donorInterestModel = require("../models/donorInterestModel");
const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");

// Create donor interest
const createDonorInterest = async (req, res) => {
    try {
        const { organisationId, dateOfBirth, gender, availability, bloodGroup } = req.body;
        const donorId = req.body.userId; // from auth middleware

        // Validate required fields
        if (!organisationId || !dateOfBirth || !gender || !availability || !bloodGroup) {
            return res.status(400).send({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if organisation exists
        const organisation = await userModel.findOne({
            _id: organisationId,
            role: "organisation",
        });

        if (!organisation) {
            return res.status(404).send({
                success: false,
                message: "Organisation not found",
            });
        }

        // Create interest record
        const interest = new donorInterestModel({
            donor: donorId,
            organisation: organisationId,
            dateOfBirth,
            gender,
            availability,
            bloodGroup,
        });

        await interest.save();

        return res.status(201).send({
            success: true,
            message: "Your interest has been registered successfully",
            interest,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error registering interest",
            error,
        });
    }
};

// Get interested donors for organisation
const getInterestedDonors = async (req, res) => {
    try {
        const organisationId = req.body.userId; // from auth middleware
        const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";

        // Verify user is organisation
        const organisation = await userModel.findOne({
            _id: organisationId,
            role: "organisation",
        });

        if (!organisation) {
            return res.status(403).send({
                success: false,
                message: "Only organisations can access this",
            });
        }

        if (!rawSearch) {
            const interests = await donorInterestModel
                .find({ organisation: organisationId })
                .populate("donor", "name email phone address preferredCity")
                .sort({ createdAt: -1 });

            return res.status(200).send({
                success: true,
                interests,
            });
        }

        const escapedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, "i");
        const organisationObjectId = new mongoose.Types.ObjectId(organisationId);

        const interests = await donorInterestModel.aggregate([
            { $match: { organisation: organisationObjectId } },
            {
                $lookup: {
                    from: "users",
                    localField: "donor",
                    foreignField: "_id",
                    as: "donor",
                },
            },
            { $unwind: "$donor" },
            {
                $match: {
                    $or: [
                        { "donor.name": { $regex: searchRegex } },
                        { "donor.email": { $regex: searchRegex } },
                        { "donor.phone": { $regex: searchRegex } },
                        { "donor.address": { $regex: searchRegex } },
                        { "donor.preferredCity": { $regex: searchRegex } },
                        { bloodGroup: { $regex: searchRegex } },
                        { gender: { $regex: searchRegex } },
                        { status: { $regex: searchRegex } },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    donor: {
                        name: "$donor.name",
                        email: "$donor.email",
                        phone: "$donor.phone",
                        address: "$donor.address",
                        preferredCity: "$donor.preferredCity",
                    },
                    organisation: 1,
                    dateOfBirth: 1,
                    gender: 1,
                    availability: 1,
                    bloodGroup: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);

        return res.status(200).send({
            success: true,
            interests,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error fetching interested donors",
            error,
        });
    }
};

// Get donor's interest history
const getDonorInterestHistory = async (req, res) => {
    try {
        const donorId = req.body.userId;

        const interests = await donorInterestModel
            .find({ donor: donorId })
            .populate("organisation", "organisationName email phone")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            interests,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error fetching interest history",
            error,
        });
    }
};

// Update interest status (for organisation)
const updateInterestStatus = async (req, res) => {
    try {
        const { interestId, status } = req.body;
        const organisationId = req.body.userId;

        const interest = await donorInterestModel.findOne({
            _id: interestId,
            organisation: organisationId,
        });

        if (!interest) {
            return res.status(404).send({
                success: false,
                message: "Interest record not found",
            });
        }

        interest.status = status;
        await interest.save();

        return res.status(200).send({
            success: true,
            message: "Status updated successfully",
            interest,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error updating status",
            error,
        });
    }
};

const markInterestAsExpired = async (req, res) => {
    try {
        const { interestId, quantity = 450, reason } = req.body;
        const organisationId = req.body.userId;

        const organisation = await userModel.findOne({
            _id: organisationId,
            role: "organisation",
        });

        if (!organisation) {
            return res.status(403).send({
                success: false,
                message: "Only organisations can mark donor interest as expired",
            });
        }

        const interest = await donorInterestModel.findOne({
            _id: interestId,
            organisation: organisationId,
        }).populate("donor", "name email");

        if (!interest) {
            return res.status(404).send({
                success: false,
                message: "Interest record not found",
            });
        }

        if (interest.status === "expired") {
            return res.status(409).send({
                success: false,
                message: "This interested donor record is already marked as expired",
            });
        }

        const existingExpired = await inventoryModel.findOne({
            expiredFromInterest: interest._id,
        });

        if (existingExpired) {
            interest.status = "expired";
            await interest.save();

            return res.status(200).send({
                success: true,
                message: "Already moved to expired blood list",
                inventoryId: existingExpired._id,
            });
        }

        const parsedQuantity = Number(quantity);
        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).send({
                success: false,
                message: "Quantity must be a positive number",
            });
        }

        const donorId = interest?.donor?._id || interest?.donor;
        if (!donorId) {
            return res.status(400).send({
                success: false,
                message: "Donor information is missing for this interest record",
            });
        }

        const expiredInventory = new inventoryModel({
            inventoryType: "in",
            bloodGroup: interest.bloodGroup,
            quantity: parsedQuantity,
            email: interest?.donor?.email || organisation.email,
            organisation: organisationId,
            donar: donorId,
            isMarkedExpired: true,
            expiredAt: new Date(),
            expiryReason: reason?.trim() || "Infectious or unsuitable blood",
            expiredFromInterest: interest._id,
        });

        await expiredInventory.save();

        interest.status = "expired";
        await interest.save();

        return res.status(200).send({
            success: true,
            message: "Moved to expired blood successfully",
            inventoryId: expiredInventory._id,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error marking donor interest as expired",
            error,
        });
    }
};

module.exports = {
    createDonorInterest,
    getInterestedDonors,
    getDonorInterestHistory,
    updateInterestStatus,
    markInterestAsExpired,
};
