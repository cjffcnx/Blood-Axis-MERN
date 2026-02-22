const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");

const EXPIRY_DAYS = 42;

const getExpiryCutoffDate = () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - EXPIRY_DAYS);
  return cutoffDate;
};

//GET BLOOD GROUP DATA
const bloodGroupDetailsContoller = async (req, res) => {
  try {
    const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
    const userId = req.body.userId;
    const user = await userModel.findById(userId).select("role");
    const expiryCutoffDate = getExpiryCutoffDate();

    if (!user || !["organisation", "hospital"].includes(user.role)) {
      return res.status(403).send({
        success: false,
        message: "Analytics is available only for organisation and hospital",
      });
    }

    let bloodGroupData = [];

    if (user.role === "organisation") {
      const organisation = new mongoose.Types.ObjectId(userId);

      const inStats = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
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

      const outStats = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);

      bloodGroupData = bloodGroups.map((bloodGroup) => {
        const inStat = inStats.find((s) => s._id === bloodGroup);
        const outStat = outStats.find((s) => s._id === bloodGroup);

        const totalIn = inStat ? inStat.total : 0;
        const totalOut = outStat ? outStat.total : 0;
        const availabeBlood = Math.max(totalIn - totalOut, 0);

        return {
          bloodGroup,
          totalIn,
          totalOut,
          availabeBlood,
        };
      });
    } else {
      const hospital = new mongoose.Types.ObjectId(userId);

      const receivedStats = await inventoryModel.aggregate([
        {
          $match: {
            hospital,
            inventoryType: "out",
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

      bloodGroupData = bloodGroups.map((bloodGroup) => {
        const received = receivedStats.find((s) => s._id === bloodGroup);
        const totalIn = received ? received.total : 0;

        return {
          bloodGroup,
          totalIn,
          totalOut: 0,
          availabeBlood: totalIn,
        };
      });
    }

    return res.status(200).send({
      success: true,
      message: "Blood Group Data Fetch Successfully",
      bloodGroupData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Bloodgroup Data Analytics API",
      error,
    });
  }
};

// GET DONOR DASHBOARD STATS
const getDonorStatsController = async (req, res) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.body.userId);

    // 1. Total Donations (Count of 'in' records)
    const totalDonations = await inventoryModel.countDocuments({
      donar: donorId,
      inventoryType: "in",
    });

    // 2. Total Units (Sum of quantity)
    const totalUnitsResult = await inventoryModel.aggregate([
      {
        $match: {
          donar: donorId,
          inventoryType: "in",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);
    const totalUnits = totalUnitsResult[0]?.total || 0;

    // 3. Last Donation Date
    const lastDonation = await inventoryModel
      .findOne({
        donar: donorId,
        inventoryType: "in",
      })
      .sort({ createdAt: -1 });

    // 4. Calculate Next Eligible Date (56 days / 8 weeks after last donation)
    let nextEligible = "Now";
    if (lastDonation) {
      const lastDonationDate = new Date(lastDonation.createdAt);
      const nextEligibleDate = new Date(lastDonationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 56); // Add 56 days (8 weeks)

      const today = new Date();
      if (nextEligibleDate > today) {
        // Still in waiting period - show the date
        nextEligible = nextEligibleDate.toISOString();
      } else {
        // Eligible to donate
        nextEligible = "Now";
      }
    }

    // 5. Top Organisations (Aggregation)
    const topOrgs = await inventoryModel.aggregate([
      {
        $match: {
          donar: donorId,
          inventoryType: "in"
        }
      },
      {
        $group: {
          _id: "$organisation",
          totalUnits: { $sum: "$quantity" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "orgDetails"
        }
      },
      {
        $unwind: "$orgDetails"
      },
      {
        $project: {
          _id: 1,
          totalUnits: 1,
          count: 1,
          organisationName: "$orgDetails.organisationName",
          email: "$orgDetails.email",
          phone: "$orgDetails.phone"
        }
      },
      { $sort: { totalUnits: -1 } },
      { $limit: 3 }
    ]);


    return res.status(200).send({
      success: true,
      totalDonations,
      totalUnits,
      lastDonation: lastDonation?.createdAt || null,
      nextEligible,
      topOrgs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error Fetching Donor API",
      error,
    });
  }
};

// GET DONOR HISTORY
const getDonorHistoryController = async (req, res) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.body.userId);

    const history = await inventoryModel
      .find({
        donar: donorId,
        inventoryType: "in",
      })
      .populate("organisation", "organisationName email phone")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).send({
      success: true,
      message: "Donor History Fetched Successfully",
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error Fetching Donor History",
      error,
    });
  }
};

module.exports = { getDonorStatsController, bloodGroupDetailsContoller, getDonorHistoryController };
