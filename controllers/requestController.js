const requestModel = require("../models/requestModel");
const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// CREATE REQUEST (Public)
const createRequestController = async (req, res) => {
    try {
        const { name, phone, bloodGroup, message, email, quantity, hospitalName, paymentStatus, hospitalId } = req.body;
        // Validation
        if (!name || !phone || !bloodGroup) {
            return res.status(400).send({
                success: false,
                message: "Please Provide All Fields",
            });
        }

        const normalizedPaymentStatus = paymentStatus === "paid" ? "paid" : "non-paid";
        const bodyAttachmentPath = typeof req.body.attachmentPath === "string" ? req.body.attachmentPath : null;
        const normalizedAttachmentPath =
            bodyAttachmentPath && bodyAttachmentPath.startsWith("/uploads/")
                ? bodyAttachmentPath
                : null;
        const attachmentFromBody = normalizedAttachmentPath
            ? path.join(__dirname, "..", normalizedAttachmentPath.replace(/^\//, ""))
            : null;

        // Handle file
        const attachment = req.file
            ? `/uploads/${req.file.filename}`
            : (attachmentFromBody && fs.existsSync(attachmentFromBody) ? normalizedAttachmentPath : null);

        if (!attachment) {
            return res.status(400).send({
                success: false,
                message: "Requisition form is required",
            });
        }

        const request = new requestModel({
            name,
            phone,
            bloodGroup,
            message,
            email,
            quantity,
            hospitalName,
            attachment,
            paymentStatus: normalizedPaymentStatus,
            requestedHospital: hospitalId || null,
            status: normalizedPaymentStatus === "paid" ? "approved" : "pending",
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

// UPLOAD REQUISITION FORM (Public, temp)
const uploadRequestAttachmentController = async (req, res) => {
    try {
        const attachment = req.file ? `/uploads/${req.file.filename}` : null;
        if (!attachment) {
            return res.status(400).send({
                success: false,
                message: "No file uploaded",
            });
        }

        return res.status(201).send({
            success: true,
            message: "Requisition form uploaded",
            attachmentPath: attachment,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error uploading requisition form",
            error,
        });
    }
};

// CLEANUP REQUISITION FORM (Public)
const cleanupRequestAttachmentController = async (req, res) => {
    try {
        const { attachmentPath } = req.body || {};
        if (typeof attachmentPath !== "string" || !attachmentPath.startsWith("/uploads/")) {
            return res.status(400).send({
                success: false,
                message: "Invalid attachment path",
            });
        }

        const fullPath = path.join(__dirname, "..", attachmentPath.replace(/^\//, ""));
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        return res.status(200).send({
            success: true,
            message: "Attachment cleaned up",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error cleaning attachment",
            error,
        });
    }
};

// GET ALL PUBLIC REQUESTS (Admin)
const getRequestsController = async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const baseFilter = {
            $or: [{ hospital: { $exists: false } }, { hospital: null }],
        };
        const filter = search
            ? {
                $and: [
                    baseFilter,
                    {
                        $or: [
                            { name: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } },
                            { phone: { $regex: search, $options: "i" } },
                            { bloodGroup: { $regex: search, $options: "i" } },
                            { hospitalName: { $regex: search, $options: "i" } },
                            { status: { $regex: search, $options: "i" } },
                            { message: { $regex: search, $options: "i" } },
                        ],
                    },
                ],
            }
            : baseFilter;

        const requests = await requestModel.find(filter).sort({ createdAt: -1 });
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

// GET APPROVED PUBLIC REQUESTS (Org/Hospital)
const getApprovedRequestsController = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select("role");
        const query = {
            status: "approved",
            $or: [{ hospital: { $exists: false } }, { hospital: null }],
        };

        if (user?.role === "organisation") {
            query.organisation = req.body.userId;
        }

        if (user?.role === "hospital") {
            query.requestedHospital = req.body.userId;
            query.$or = [
                { status: "approved" },
                { paymentStatus: "paid" },
            ];
        }

        const requests = await requestModel.find(query).sort({ createdAt: -1 });
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
        const { status, organisationId } = req.body;
        const { id } = req.params;

        const existingRequest = await requestModel.findById(id);
        if (!existingRequest) {
            return res.status(404).send({
                success: false,
                message: "Request not found",
            });
        }

        if (existingRequest.hospital) {
            return res.status(400).send({
                success: false,
                message: "Only public emergency requests can be approved or rejected here",
            });
        }

        const update = { status };

        if (status === "approved" && organisationId) {
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

            update.organisation = organisationId;
        }

        if (status === "rejected") {
            update.organisation = null;
        }

        const request = await requestModel.findByIdAndUpdate(id, update, { new: true });
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
        const { bloodGroup, quantity, message, organisationId, paymentStatus } = req.body;
        // Validation
        if (!bloodGroup || !quantity) {
            return res.status(400).send({
                success: false,
                message: "Blood Group and Quantity are required",
            });
        }

        if (!organisationId) {
            return res.status(400).send({
                success: false,
                message: "Please select an organisation",
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
            organisation: organisationId, // Required target organisation
            status: "pending",
            paymentStatus: paymentStatus === "paid" ? "paid" : "non-paid",
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
        const organisationId = req.body.userId;

        const requests = await requestModel.find({
            hospital: { $exists: true }, // Only hospital requests
            organisation: organisationId, // Only requests targeted to this organisation
            status: "pending",
        })
            .populate("hospital", "hospitalName name phone email address")
            .populate("organisation", "organisationName email phone")
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

        // Create OUT inventory record (organisation stock decreases)
        const inventoryRecord = new inventoryModel({
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
            quantity: requestedQuantity,
            email: request.hospital.email,
            organisation: organisationId,
            hospital: request.hospital._id,
        });
        await inventoryRecord.save();

        // Create IN inventory record for hospital (hospital stock increases)
        const hospitalInventoryRecord = new inventoryModel({
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
            quantity: requestedQuantity,
            email: request.hospital.email,
            organisation: request.hospital._id,
            donar: organisationId,
        });
        await hospitalInventoryRecord.save();

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

// UPDATE PAYMENT STATUS (Hospital - public requests)
const updatePaymentStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (paymentStatus !== "paid") {
            return res.status(400).send({
                success: false,
                message: "Invalid payment status",
            });
        }

        const user = await userModel.findById(req.body.userId).select("role");
        if (!user || user.role !== "hospital") {
            return res.status(403).send({
                success: false,
                message: "Only hospitals can update payment status",
            });
        }

        const request = await requestModel.findById(id);
        if (!request) {
            return res.status(404).send({
                success: false,
                message: "Request not found",
            });
        }

        if (request.hospital) {
            return res.status(403).send({
                success: false,
                message: "Payment updates only allowed for public requests",
            });
        }

        if (request.paymentStatus === "paid") {
            return res.status(200).send({
                success: true,
                message: "Payment already marked as paid",
                request,
            });
        }

        request.paymentStatus = "paid";
        await request.save();

        return res.status(200).send({
            success: true,
            message: "Payment status updated to paid",
            request,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error updating payment status",
            error,
        });
    }
};

// LIST ORGANISATIONS (for hospital selection)
const getOrganisationsController = async (req, res) => {
    try {
        const organisations = await userModel
            .find({ role: "organisation" })
            .select("organisationName name email phone address");

        return res.status(200).send({
            success: true,
            message: "Organisations fetched successfully",
            organisations,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error fetching organisations",
            error,
        });
    }
};

module.exports = {
    createRequestController,
    uploadRequestAttachmentController,
    cleanupRequestAttachmentController,
    getRequestsController,
    getApprovedRequestsController,
    updateRequestStatusController,
    createHospitalRequestController,
    getHospitalRequestsForOrgController,
    fulfillRequestController,
    getHospitalRequestsForHospitalController,
    confirmRequestController,
    approveRequestController,
    rejectRequestController,
    getOrganisationsController,
    updatePaymentStatusController
};
