const donorInterestModel = require("../models/donorInterestModel");
const userModel = require("../models/userModel");
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

        const interests = await donorInterestModel
            .find({ organisation: organisationId })
            .populate("donor", "name email phone address preferredCity")
            .sort({ createdAt: -1 });

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

module.exports = {
    createDonorInterest,
    getInterestedDonors,
    getDonorInterestHistory,
    updateInterestStatus,
};
