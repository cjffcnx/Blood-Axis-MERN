const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

const EXPIRY_DAYS = 42;
const DISPOSAL_METHODS = ["incineration", "biohazard", "autoclave", "chemical", "other"];

const getExpiryCutoffDate = () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - EXPIRY_DAYS);
  return cutoffDate;
};

const getRoleScopedInventoryQuery = (role, userId) => {
  if (role === "organisation") {
    return { organisation: userId, inventoryType: "in" };
  }

  if (role === "hospital") {
    return { hospital: userId, inventoryType: "out" };
  }

  return null;
};

// CREATE INVENTORY
const createInventoryController = async (req, res) => {
  try {
    const { email } = req.body;
    const expiryCutoffDate = getExpiryCutoffDate();
    //validation
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User Not Found");
    }
    // if (inventoryType === "in" && user.role !== "donar") {
    //   throw new Error("Not a donar account");
    // }
    // if (inventoryType === "out" && user.role !== "hospital") {
    //   throw new Error("Not a hospital");
    // }

    if (req.body.inventoryType == "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(req.body.userId);
      //calculate Blood Quanitity
      const totalInOfRequestedBlood = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
            createdAt: { $gte: expiryCutoffDate },
            isDisposed: { $ne: true },
            isMarkedExpired: { $ne: true },
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      // console.log("Total In", totalInOfRequestedBlood);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;
      //calculate OUT Blood Quanitity

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

      //in & Out Calc
      const availableQuanityOfBloodGroup = totalIn - totalOut;
      //quantity validation
      if (availableQuanityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuanityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
        });
      }
      req.body.hospital = user?._id;
    } else {
      req.body.donar = user?._id;
    }

    //save record
    const inventory = new inventoryModel(req.body);
    await inventory.save();
    return res.status(201).send({
      success: true,
      message: "New Blood Reocrd Added",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Errro In Create Inventory API",
      error,
    });
  }
};

// GET ALL BLOOD RECORS
const getInventoryController = async (req, res) => {
  try {
    const expiryCutoffDate = getExpiryCutoffDate();
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
        $or: [
          { inventoryType: "out" },
          {
            inventoryType: "in",
            createdAt: { $gte: expiryCutoffDate },
            isDisposed: { $ne: true },
            isMarkedExpired: { $ne: true },
          },
        ],
      })
      .populate("donar")
      .populate("hospital")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).send({
      success: true,
      messaage: "get all records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get All Inventory",
      error,
    });
  }
};
// GET Hospital BLOOD RECORS
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters)
      .populate("donar")
      .populate("hospital")
      .populate("organisation")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).send({
      success: true,
      messaage: "get hospital comsumer records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get consumer Inventory",
      error,
    });
  }
};

// GET BLOOD RECORD OF 3
const getRecentInventoryController = async (req, res) => {
  try {
    const expiryCutoffDate = getExpiryCutoffDate();
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
        $or: [
          { inventoryType: "out" },
          {
            inventoryType: "in",
            createdAt: { $gte: expiryCutoffDate },
            isDisposed: { $ne: true },
            isMarkedExpired: { $ne: true },
          },
        ],
      })
      .limit(3)
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).send({
      success: true,
      message: "recent Invenotry Data",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Recent Inventory API",
      error,
    });
  }
};

// GET DONAR RECORDS WITH BLOOD GROUP FROM INVENTORIES
const getDonarsWithBloodGroupController = async (req, res) => {
  try {
    const organisation = req.body.userId;

    // Find all donors for this organisation
    const donorId = await inventoryModel.distinct("donar", {
      organisation,
    });

    // Get user details for each donor
    const donars = await userModel.find({ _id: { $in: donorId } });

    // For each donor, get their blood groups from inventories
    const donarsWithBloodGroups = await Promise.all(
      donars.map(async (donor) => {
        // Get the most recent blood group(s) from inventories
        const bloodGroupDocuments = await inventoryModel
          .find({
            donar: donor._id,
            organisation,
            inventoryType: "in", // Only donation records
          })
          .sort({ createdAt: -1 })
          .limit(1);

        const bloodGroup = bloodGroupDocuments.length > 0
          ? bloodGroupDocuments[0].bloodGroup
          : "Not Available";

        return {
          ...donor.toObject(),
          bloodGroup, // Override with blood group from inventories
        };
      })
    );

    return res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars: donarsWithBloodGroups,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donar records",
      error,
    });
  }
};

// GET DONAR REOCRDS
const getDonarsController = async (req, res) => {
  try {
    const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const organisation = req.body.userId;
    //find donars
    const donorId = await inventoryModel.distinct("donar", {
      organisation,
    });
    // console.log(donorId);
    const escapedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = rawSearch ? new RegExp(escapedSearch, "i") : null;
    const donarsQuery = {
      _id: { $in: donorId },
      ...(searchRegex
        ? {
          $or: [
            { name: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
            { phone: { $regex: searchRegex } },
            { address: { $regex: searchRegex } },
          ],
        }
        : {}),
    };
    const donars = await userModel.find(donarsQuery);

    return res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donar records",
      error,
    });
  }
};

const getHospitalController = async (req, res) => {
  try {
    const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const escapedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = rawSearch ? new RegExp(escapedSearch, "i") : null;
    // Fetch all hospitals from database
    const hospitals = await userModel
      .find({
        role: "hospital",
        ...(searchRegex
          ? {
            $or: [
              { hospitalName: { $regex: searchRegex } },
              { email: { $regex: searchRegex } },
              { phone: { $regex: searchRegex } },
              { address: { $regex: searchRegex } },
            ],
          }
          : {}),
      })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error,
    });
  }
};

const getPublicHospitalsController = async (req, res) => {
  try {
    const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const escapedSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = rawSearch ? new RegExp(escapedSearch, "i") : null;

    const hospitals = await userModel
      .find({
        role: "hospital",
        ...(searchRegex
          ? {
            $or: [
              { hospitalName: { $regex: searchRegex } },
              { email: { $regex: searchRegex } },
              { phone: { $regex: searchRegex } },
              { address: { $regex: searchRegex } },
            ],
          }
          : {}),
      })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error,
    });
  }
};

// GET ORG PROFILES
const getOrgnaisationController = async (req, res) => {
  try {
    // Fetch all organisations from database
    const organisations = await userModel
      .find({ role: "organisation" })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error,
    });
  }
};
// GET ORG for Hospital
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.body.userId;

    // Find all organisations only (not hospitals)
    const organisations = await userModel
      .find({ role: "organisation" })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Hospital Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital ORG API",
      error,
    });
  }
};

const getExpiredBloodController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const expiryCutoffDate = getExpiryCutoffDate();
    const user = await userModel.findById(userId).select("role");

    if (!user || !["organisation", "hospital"].includes(user.role)) {
      return res.status(403).send({
        success: false,
        message: "Only organisation and hospital can view expired blood records",
      });
    }

    const scopeQuery = getRoleScopedInventoryQuery(user.role, userId);
    const query = {
      ...scopeQuery,
      isDisposed: { $ne: true },
      $or: [
        { createdAt: { $lt: expiryCutoffDate } },
        { isMarkedExpired: true },
      ],
    };

    const expiredInventory = await inventoryModel
      .find(query)
      .populate("donar", "name email phone address")
      .populate("hospital", "hospitalName email phone address")
      .populate("organisation", "organisationName email phone address")
      .sort({ createdAt: -1 })
      .lean();

    const normalizedInventory = expiredInventory.map((record) => {
      const createdAtDate = new Date(record.createdAt);
      const ageInDays = Math.floor((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24));
      const expiresAt = record.isMarkedExpired && record.expiredAt
        ? new Date(record.expiredAt)
        : new Date(createdAtDate);
      if (!(record.isMarkedExpired && record.expiredAt)) {
        expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);
      }

      return {
        ...record,
        ageInDays,
        expiresAt,
      };
    });

    return res.status(200).send({
      success: true,
      message: "Expired blood records fetched successfully",
      expiredInventory: normalizedInventory,
      expiryDays: EXPIRY_DAYS,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in expired blood API",
      error,
    });
  }
};

const markBloodDisposedController = async (req, res) => {
  try {
    const { inventoryId, disposalMethod } = req.body;
    const userId = req.body.userId;
    const user = await userModel.findById(userId).select("role");
    const expiryCutoffDate = getExpiryCutoffDate();

    if (!user || !["organisation", "hospital"].includes(user.role)) {
      return res.status(403).send({
        success: false,
        message: "Only organisation and hospital can dispose blood records",
      });
    }

    if (!inventoryId) {
      return res.status(400).send({
        success: false,
        message: "Inventory id is required",
      });
    }

    if (!DISPOSAL_METHODS.includes(disposalMethod)) {
      return res.status(400).send({
        success: false,
        message: "Invalid disposal method",
      });
    }

    const scopeQuery = getRoleScopedInventoryQuery(user.role, userId);
    const inventoryRecord = await inventoryModel.findOne({
      _id: inventoryId,
      ...scopeQuery,
    });

    if (!inventoryRecord) {
      return res.status(404).send({
        success: false,
        message: "Inventory record not found",
      });
    }

    if (inventoryRecord.createdAt >= expiryCutoffDate && !inventoryRecord.isMarkedExpired) {
      return res.status(400).send({
        success: false,
        message: `Only blood older than ${EXPIRY_DAYS} days can be disposed`,
      });
    }

    if (inventoryRecord.isDisposed) {
      return res.status(409).send({
        success: false,
        message: "This blood record is already disposed",
      });
    }

    inventoryRecord.isDisposed = true;
    inventoryRecord.disposedAt = new Date();
    inventoryRecord.disposalMethod = disposalMethod;
    await inventoryRecord.save();

    return res.status(200).send({
      success: true,
      message: "Blood marked as disposed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while disposing blood",
      error,
    });
  }
};

const getDisposedHistoryController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await userModel.findById(userId).select("role");

    if (!user || !["organisation", "hospital"].includes(user.role)) {
      return res.status(403).send({
        success: false,
        message: "Only organisation and hospital can view disposed history",
      });
    }

    const scopeQuery = getRoleScopedInventoryQuery(user.role, userId);
    const disposedHistory = await inventoryModel
      .find({
        ...scopeQuery,
        isDisposed: true,
      })
      .populate("donar", "name email phone address")
      .populate("hospital", "hospitalName email phone address")
      .populate("organisation", "organisationName email phone address")
      .sort({ disposedAt: -1 })
      .lean();

    const normalizedHistory = disposedHistory.map((record) => {
      const createdAtDate = new Date(record.createdAt);
      const ageInDays = Math.floor((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24));
      const expiresAt = new Date(createdAtDate);
      expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

      return {
        ...record,
        ageInDays,
        expiresAt,
      };
    });

    return res.status(200).send({
      success: true,
      message: "Disposed history fetched successfully",
      disposedHistory: normalizedHistory,
      expiryDays: EXPIRY_DAYS,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in disposed history API",
      error,
    });
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getDonarsWithBloodGroupController,
  getHospitalController,
  getPublicHospitalsController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
  getExpiredBloodController,
  markBloodDisposedController,
  getDisposedHistoryController,
};
