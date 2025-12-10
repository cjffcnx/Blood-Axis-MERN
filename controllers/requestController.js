const requestModel = require("../models/requestModel");
const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");

// CREATE REQUEST (Public)
const createRequestController = async (req, res) => {
    try {
        const { name, phone, bloodGroup, message } = req.body;
        // Validation
        if (!name || !phone || !bloodGroup) {
            return res.status(400).send({
                success: false,
                message: "Please Provide All Fields",
            });
        }

        // Handle file
        const attachment = req.file ? `/uploads/${req.file.filename}` : null;

        const request = new requestModel({
            name,
            phone,
            bloodGroup,
            message,
            attachment
        });

        await request.save();
        return res.status(201).send({
            success: true,
            message: "Blood Request Submitted Successfully",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Create Request API",
            error,
        });
    }
};

// GET ALL REQUESTS (Admin)
const getRequestsController = async (req, res) => {
    try {
        const requests = await requestModel.find({}).sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "All Blood Requests Fetched Successfully",
            requests,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get Requests API",
            error,
        });
    }
};

// GET APPROVED REQUESTS (Org/Hospital)
const getApprovedRequestsController = async (req, res) => {
    try {
        const requests = await requestModel.find({ status: "approved" }).sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "Approved Blood Requests Fetched Successfully",
            requests,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get Approved Requests API",
            error,
        });
    }
};

// UPDATE STATUS (Admin)
const updateRequestStatusController = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const request = await requestModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        return res.status(200).send({
            success: true,
            message: "Request Status Updated",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Update Request API",
            error,
        });
    }
};

// CREATE HOSPITAL REQUEST (Hospital)
const createHospitalRequestController = async (req, res) => {
    try {
        const { bloodGroup, quantity, message, organisationId } = req.body;
        // Validation
        if (!bloodGroup || !quantity) {
            return res.status(400).send({
                success: false,
                message: "Blood Group and Quantity are required",
            });
        }

        // Fetch User to get Name and Phone (Required by Request Model)
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const request = new requestModel({
            hospital: req.body.userId, // From authMiddleware
            name: user.hospitalName || user.name, // Use hospitalName, fallback to name
            phone: user.phone,
            bloodGroup,
            quantity,
            message,
            organisation: organisationId || null, // Optional target
            status: "pending"
        });

        await request.save();
        return res.status(201).send({
            success: true,
            message: "Supply Request Submitted Successfully",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Create Hospital Request API",
            error,
        });
    }
};

// GET HOSPITAL REQUESTS FOR ORG
const getHospitalRequestsForOrgController = async (req, res) => {
    try {
        const requests = await requestModel.find({
            hospital: { $exists: true }, // Only hospital requests
            status: "pending"
        })
            .populate("hospital", "hospitalName name phone email address")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            message: "Hospital Requests Fetched",
            requests,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Fetching Requests",
            error,
        });
    }
};
// FULFILL REQUEST (Org)
const fulfillRequestController = async (req, res) => {
    try {
        const { id } = req.params;
        const organisationId = req.body.userId;

        // Fetch the request
        const request = await requestModel.findById(id).populate("hospital");
        if (!request) {
            return res.status(404).send({
                success: false,
                message: "Request not found",
            });
        }

        const requestedBloodGroup = request.bloodGroup;
        const requestedQuantity = request.quantity;
        const organisation = new mongoose.Types.ObjectId(organisationId);

        // Calculate available blood stock
        const totalInOfRequestedBlood = await inventoryModel.aggregate([
            {
                $match: {
                    organisation,
                    inventoryType: "in",
                    bloodGroup: requestedBloodGroup,
                },
            },
            {
                $group: {
                    _id: "$bloodGroup",
                    total: { $sum: "$quantity" },
                },
            },
        ]);
        const totalIn = totalInOfRequestedBlood[0]?.total || 0;

        const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
            {
                $match: {
                    organisation,
                    inventoryType: "out",
                    bloodGroup: requestedBloodGroup,
                },
            },
            {
                $group: {
                    _id: "$bloodGroup",
                    total: { $sum: "$quantity" },
                },
            },
        ]);
        const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

        const availableQuantity = totalIn - totalOut;

        // Check if enough stock
        if (availableQuantity < requestedQuantity) {
            return res.status(400).send({
                success: false,
                message: `Only ${availableQuantity}ML of ${requestedBloodGroup.toUpperCase()} is available. Cannot fulfill request.`,
            });
        }

        // Create OUT inventory record
        const inventoryRecord = new inventoryModel({
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
            quantity: requestedQuantity,
            email: request.hospital.email,
            organisation: organisationId,
            hospital: request.hospital._id,
        });
        await inventoryRecord.save();

        // Update request status and save organisation
        request.status = "fulfilled";
        request.organisation = organisationId;
        await request.save();

        return res.status(200).send({
            success: true,
            message: "Blood Sent Successfully",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error Fulfilling Request",
            error,
        });
    }
};

// GET HOSPITAL REQUESTS (Hospital View)
const getHospitalRequestsForHospitalController = async (req, res) => {
    try {
        const requests = await requestModel.find({
            hospital: req.body.userId // Filter by logged in hospital
        })
            .populate("organisation", "organisationName email phone address") // Show who fulfilled it
            .sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            message: "Your Requests Fetched",
            requests,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Fetching Your Requests",
            error,
        });
    }
};

// CONFIRM RECEIPT (Hospital)
const confirmRequestController = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await requestModel.findByIdAndUpdate(
            id,
            { status: "completed" },
            { new: true }
        );
        return res.status(200).send({
            success: true,
            message: "Blood Receipt Confirmed",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error Confirming Receipt",
            error,
        });
    }
};

// APPROVE RECEIPT (Hospital)
const approveRequestController = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await requestModel.findById(id).populate("hospital organisation");

        if (!request) {
            return res.status(404).send({
                success: false,
                message: "Request not found",
            });
        }

        if (request.status !== "fulfilled") {
            return res.status(400).send({
                success: false,
                message: "Only fulfilled requests can be approved",
            });
        }

        // Create IN inventory record for hospital (they received the blood)
        // For blood transfers between org and hospital, we treat the organisation (sender) as the donor
        const hospitalInventoryRecord = new inventoryModel({
            inventoryType: "in",
            bloodGroup: request.bloodGroup,
            quantity: request.quantity,
            email: request.hospital.email,
            organisation: request.hospital._id, // Hospital receives it
            donar: request.organisation._id, // Organization is the donar (sender)
        });
        await hospitalInventoryRecord.save();

        request.status = "completed";
        await request.save();

        return res.status(200).send({
            success: true,
            message: "Blood shipment approved and received successfully",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error Approving Receipt",
            error,
        });
    }
};

// REJECT RECEIPT (Hospital)
const rejectRequestController = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await requestModel.findById(id);

        if (!request) {
            return res.status(404).send({
                success: false,
                message: "Request not found",
            });
        }

        if (request.status !== "fulfilled") {
            return res.status(400).send({
                success: false,
                message: "Only fulfilled requests can be rejected",
            });
        }

        // When rejected, revert the inventory record
        // Find the inventory OUT record for this request
        const inventoryRecord = await inventoryModel.findOne({
            hospital: request.hospital,
            organisation: request.organisation,
            bloodGroup: request.bloodGroup,
            quantity: request.quantity,
            inventoryType: "out"
        }).sort({ createdAt: -1 }).limit(1);

        // Delete the inventory OUT record to restore organisation's stock
        if (inventoryRecord) {
            await inventoryModel.findByIdAndDelete(inventoryRecord._id);
        }

        request.status = "rejected";
        request.organisation = null; // Clear organisation assignment
        await request.save();

        return res.status(200).send({
            success: true,
            message: "Blood shipment rejected. Stock has been restored to organisation.",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error Rejecting Receipt",
            error,
        });
    }
};

module.exports = {
    createRequestController,
    getRequestsController,
    getApprovedRequestsController,
    updateRequestStatusController,
    createHospitalRequestController,
    getHospitalRequestsForOrgController,
    fulfillRequestController,
    getHospitalRequestsForHospitalController,
    confirmRequestController,
    approveRequestController,
    rejectRequestController
};
