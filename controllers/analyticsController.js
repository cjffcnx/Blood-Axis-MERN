const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");

//GET BLOOD GROUP DATA
const bloodGroupDetailsContoller = async (req, res) => {
  try {
    const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
    const organisation = new mongoose.Types.ObjectId(req.body.userId);

    // Optimized Aggregation: One query instead of loop
    const stats = await inventoryModel.aggregate([
      {
        $match: {
          organisation,
          inventoryType: { $in: ["in", "out"] },
        },
      },
      {
        $group: {
          _id: {
            bloodGroup: "$bloodGroup",
            type: "$inventoryType",
          },
          total: { $sum: "$quantity" },
        },
      },
    ]);

    // Map result to simpler structure
    const bloodGroupData = bloodGroups.map((bloodGroup) => {
      const inStat = stats.find(
        (s) => s._id.bloodGroup === bloodGroup && s._id.type === "in"
      );
      const outStat = stats.find(
        (s) => s._id.bloodGroup === bloodGroup && s._id.type === "out"
      );

      const totalIn = inStat ? inStat.total : 0;
      const totalOut = outStat ? outStat.total : 0;
      const availabeBlood = totalIn - totalOut;

      return {
        bloodGroup,
        totalIn,
        totalOut,
        availabeBlood,
      };
    });

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

    // 4. Top Organisations (Aggregation)
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
