const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

const getAvailableUnits = async (organisationId, bloodGroup) => {
    const organisation = new mongoose.Types.ObjectId(organisationId);
    const totals = await inventoryModel.aggregate([
        {
            $match: {
                organisation,
                bloodGroup,
            },
        },
        {
            $group: {
                _id: "$inventoryType",
                total: { $sum: "$quantity" },
            },
        },
    ]);

    const totalIn = totals.find((row) => row._id === "in")?.total || 0;
    const totalOut = totals.find((row) => row._id === "out")?.total || 0;
    return totalIn - totalOut;
};

const getAvailabilityMap = async (bloodGroup) => {
    const totals = await inventoryModel.aggregate([
        {
            $match: {
                bloodGroup,
            },
        },
        {
            $group: {
                _id: {
                    organisation: "$organisation",
                    inventoryType: "$inventoryType",
                },
                total: { $sum: "$quantity" },
            },
        },
    ]);

    const availabilityMap = new Map();
    totals.forEach((row) => {
        const organisationId = row._id.organisation.toString();
        const current = availabilityMap.get(organisationId) || { in: 0, out: 0 };
        if (row._id.inventoryType === "in") {
            current.in = row.total;
        } else {
            current.out = row.total;
        }
        availabilityMap.set(organisationId, current);
    });

    const result = new Map();
    availabilityMap.forEach((value, key) => {
        const availableUnits = value.in - value.out;
        if (availableUnits > 0) {
            result.set(key, availableUnits);
        }
    });

    return result;
};

const validateBloodRequestController = async (req, res) => {
    try {
        const { hospitalId, bloodGroup, quantity } = req.body;

        if (!hospitalId || !bloodGroup) {
            return res.status(400).send({
                success: false,
                message: "Hospital and blood group are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).send({
                success: false,
                message: "Invalid hospital ID",
            });
        }

        const requestedUnits = Number(quantity);
        const requiredUnits = Number.isFinite(requestedUnits) && requestedUnits > 0 ? requestedUnits : 1;

        const availableUnits = await getAvailableUnits(hospitalId, bloodGroup);
        const hasStock = availableUnits >= requiredUnits;

        let alternatives = [];
        if (!hasStock) {
            const availabilityMap = await getAvailabilityMap(bloodGroup);
            availabilityMap.delete(hospitalId.toString());

            const candidates = await userModel
                .find({
                    role: { $in: ["hospital", "organisation"] },
                    _id: { $ne: hospitalId },
                })
                .select("hospitalName organisationName name role address phone latitude longitude")
                .lean();

            alternatives = candidates
                .map((candidate) => ({
                    id: candidate._id.toString(),
                    name: candidate.hospitalName || candidate.organisationName || candidate.name,
                    role: candidate.role,
                    address: candidate.address,
                    phone: candidate.phone,
                    latitude: Number.isFinite(Number(candidate.latitude)) ? Number(candidate.latitude) : null,
                    longitude: Number.isFinite(Number(candidate.longitude)) ? Number(candidate.longitude) : null,
                    availableUnits: availabilityMap.get(candidate._id.toString()) || 0,
                }))
                .sort((a, b) => b.availableUnits - a.availableUnits);
        }

        return res.status(200).send({
            success: true,
            hasStock,
            availableUnits,
            requiredUnits,
            alternatives,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error validating blood request",
            error,
        });
    }
};

module.exports = {
    validateBloodRequestController,
};
