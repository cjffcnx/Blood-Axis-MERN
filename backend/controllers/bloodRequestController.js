const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

const EXPIRY_DAYS = 42;
const ML_PER_UNIT = 350;

const getExpiryCutoffDate = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - EXPIRY_DAYS);
    return cutoffDate;
};

const getProviderAvailabilityMap = async (bloodGroup) => {
    const expiryCutoffDate = getExpiryCutoffDate();

    const organisationInStats = await inventoryModel.aggregate([
        {
            $match: {
                bloodGroup,
                inventoryType: "in",
                createdAt: { $gte: expiryCutoffDate },
                isDisposed: { $ne: true },
                isMarkedExpired: { $ne: true },
            },
        },
        {
            $group: {
                _id: "$organisation",
                total: { $sum: "$quantity" },
            },
        },
    ]);

    const organisationOutStats = await inventoryModel.aggregate([
        {
            $match: {
                bloodGroup,
                inventoryType: "out",
            },
        },
        {
            $group: {
                _id: "$organisation",
                total: { $sum: "$quantity" },
            },
        },
    ]);

    const hospitalReceivedStats = await inventoryModel.aggregate([
        {
            $match: {
                bloodGroup,
                inventoryType: "out",
                createdAt: { $gte: expiryCutoffDate },
                isDisposed: { $ne: true },
                isMarkedExpired: { $ne: true },
            },
        },
        {
            $group: {
                _id: "$hospital",
                total: { $sum: "$quantity" },
            },
        },
    ]);

    const organisationInMap = new Map(
        organisationInStats.map((row) => [row._id?.toString(), row.total || 0])
    );
    const organisationOutMap = new Map(
        organisationOutStats.map((row) => [row._id?.toString(), row.total || 0])
    );
    const hospitalInMap = new Map(
        hospitalReceivedStats.map((row) => [row._id?.toString(), row.total || 0])
    );

    const result = new Map();

    const organisationIds = new Set([
        ...organisationInMap.keys(),
        ...organisationOutMap.keys(),
    ]);

    organisationIds.forEach((id) => {
        if (!id) return;
        const totalIn = organisationInMap.get(id) || 0;
        const totalOut = organisationOutMap.get(id) || 0;
        const availableUnits = Math.max(totalIn - totalOut, 0);
        result.set(id, availableUnits);
    });

    hospitalInMap.forEach((totalIn, id) => {
        if (!id) return;
        result.set(id, Math.max(totalIn, 0));
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

        const provider = await userModel.findById(hospitalId).select("role").lean();
        if (!provider || !["hospital", "organisation"].includes(provider.role)) {
            return res.status(400).send({
                success: false,
                message: "Selected provider is invalid",
            });
        }

        const requestedUnits = Number(quantity);
        const requiredUnits = Number.isFinite(requestedUnits) && requestedUnits > 0 ? requestedUnits : 1;
        const requiredMl = requiredUnits * ML_PER_UNIT;

        const availabilityMap = await getProviderAvailabilityMap(bloodGroup);
        const availableUnits = availabilityMap.get(hospitalId.toString()) || 0;
        const hasStock = availableUnits >= requiredMl;

        let alternatives = [];
        if (!hasStock) {
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
                .filter((candidate) => candidate.availableUnits > 0)
                .sort((a, b) => b.availableUnits - a.availableUnits);
        }

        return res.status(200).send({
            success: true,
            hasStock,
            availableUnits,
            requiredUnits,
            requiredMl,
            mlPerUnit: ML_PER_UNIT,
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
