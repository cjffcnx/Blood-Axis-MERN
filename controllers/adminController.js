const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");

//GET DONAR LIST
const getDonarsListController = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const sortBy = (req.query.sort || "date").trim();
    const baseFilter = { role: "donar" };
    const filter = search
      ? {
        ...baseFilter,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { preferredCity: { $regex: search, $options: "i" } },
        ],
      }
      : baseFilter;

    // Determine sort order for createdAt
    let dateSortOrder = -1; // -1 for newest first (default)
    if (sortBy === "date-old") {
      dateSortOrder = 1; // 1 for oldest first
    }

    // For date-based sorting, we can use MongoDB's natural sort
    const donarData = await userModel
      .find(filter)
      .sort(
        sortBy === "date" || sortBy === "date-old"
          ? { createdAt: dateSortOrder }
          : { createdAt: -1 } // default fallback
      );

    // Get donation counts for each donor from inventory (inventoryType: "in" = donation)
    const donarDataWithDonationCount = await Promise.all(
      donarData.map(async (donor) => {
        const donationCount = await inventoryModel.countDocuments({
          donar: donor._id,
          inventoryType: "in",
        });
        return {
          ...donor.toObject(),
          donationCount,
        };
      })
    );

    // Sort by donations if requested
    let finalData = donarDataWithDonationCount;
    if (sortBy === "donations-high") {
      finalData = donarDataWithDonationCount.sort(
        (a, b) => b.donationCount - a.donationCount
      );
    } else if (sortBy === "donations-low") {
      finalData = donarDataWithDonationCount.sort(
        (a, b) => a.donationCount - b.donationCount
      );
    }

    return res.status(200).send({
      success: true,
      Toatlcount: finalData.length,
      message: "Donar List Fetched Successfully",
      donarData: finalData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In DOnar List API",
      error,
    });
  }
};
//GET HOSPITAL LIST
const getHospitalListController = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const baseFilter = { role: "hospital" };
    const filter = search
      ? {
        ...baseFilter,
        $or: [
          { hospitalName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      }
      : baseFilter;

    const hospitalData = await userModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: hospitalData.length,
      message: "HOSPITAL List Fetched Successfully",
      hospitalData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital List API",
      error,
    });
  }
};
//GET ORG LIST
const getOrgListController = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const baseFilter = { role: "organisation" };
    const filter = search
      ? {
        ...baseFilter,
        $or: [
          { organisationName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      }
      : baseFilter;

    const orgData = await userModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: orgData.length,
      message: "ORG List Fetched Successfully",
      orgData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG List API",
      error,
    });
  }
};
// =======================================

//DELETE DONAR
const deleteDonarController = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message: " Record Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while deleting ",
      error,
    });
  }
};

//UPDATE DONAR
const updateDonarController = async (req, res) => {
  try {
    const donorId = req.params.id;
    const {
      name,
      email,
      phone,
      address,
      preferredCity,
      isAvailable,
      website,
    } = req.body;

    const donor = await userModel.findById(donorId);
    if (!donor) {
      return res.status(404).send({
        success: false,
        message: "Donor not found",
      });
    }

    if (email && email !== donor.email) {
      const emailExists = await userModel.findOne({
        email,
        _id: { $ne: donorId },
      });
      if (emailExists) {
        return res.status(400).send({
          success: false,
          message: "Email already in use by another account",
        });
      }
      donor.email = email;
    }

    if (name !== undefined) donor.name = name;
    if (phone !== undefined) donor.phone = phone;
    if (address !== undefined) donor.address = address;
    if (preferredCity !== undefined) donor.preferredCity = preferredCity;
    if (website !== undefined) donor.website = website;
    if (isAvailable !== undefined) donor.isAvailable = isAvailable;

    await donor.save();

    return res.status(200).send({
      success: true,
      message: "Donor updated successfully",
      donor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error updating donor",
      error,
    });
  }
};

//UPDATE HOSPITAL
const updateHospitalController = async (req, res) => {
  try {
    const hospitalId = req.params.id;
    const { hospitalName, email, phone, address, website, isAvailable, latitude, longitude } = req.body;

    const hospital = await userModel.findById(hospitalId);
    if (!hospital) {
      return res.status(404).send({
        success: false,
        message: "Hospital not found",
      });
    }

    if (email && email !== hospital.email) {
      const emailExists = await userModel.findOne({
        email,
        _id: { $ne: hospitalId },
      });
      if (emailExists) {
        return res.status(400).send({
          success: false,
          message: "Email already in use by another account",
        });
      }
      hospital.email = email;
    }

    if (hospitalName !== undefined) hospital.hospitalName = hospitalName;
    if (phone !== undefined) hospital.phone = phone;
    if (address !== undefined) hospital.address = address;
    if (website !== undefined) hospital.website = website;
    if (isAvailable !== undefined) hospital.isAvailable = isAvailable;
    if (latitude !== undefined && latitude !== "") {
      const parsedLatitude = Number(latitude);
      if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
        return res.status(400).send({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }
      hospital.latitude = parsedLatitude;
    }
    if (longitude !== undefined && longitude !== "") {
      const parsedLongitude = Number(longitude);
      if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
        return res.status(400).send({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }
      hospital.longitude = parsedLongitude;
    }

    await hospital.save();

    return res.status(200).send({
      success: true,
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error updating hospital",
      error,
    });
  }
};

//UPDATE ORGANISATION
const updateOrgController = async (req, res) => {
  try {
    const orgId = req.params.id;
    const { organisationName, email, phone, address, website, isAvailable, latitude, longitude } = req.body;

    const organisation = await userModel.findById(orgId);
    if (!organisation) {
      return res.status(404).send({
        success: false,
        message: "Organisation not found",
      });
    }

    if (email && email !== organisation.email) {
      const emailExists = await userModel.findOne({
        email,
        _id: { $ne: orgId },
      });
      if (emailExists) {
        return res.status(400).send({
          success: false,
          message: "Email already in use by another account",
        });
      }
      organisation.email = email;
    }

    if (organisationName !== undefined) organisation.organisationName = organisationName;
    if (phone !== undefined) organisation.phone = phone;
    if (address !== undefined) organisation.address = address;
    if (website !== undefined) organisation.website = website;
    if (isAvailable !== undefined) organisation.isAvailable = isAvailable;
    if (latitude !== undefined && latitude !== "") {
      const parsedLatitude = Number(latitude);
      if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
        return res.status(400).send({
          success: false,
          message: "Latitude must be between -90 and 90",
        });
      }
      organisation.latitude = parsedLatitude;
    }
    if (longitude !== undefined && longitude !== "") {
      const parsedLongitude = Number(longitude);
      if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
        return res.status(400).send({
          success: false,
          message: "Longitude must be between -180 and 180",
        });
      }
      organisation.longitude = parsedLongitude;
    }

    await organisation.save();

    return res.status(200).send({
      success: true,
      message: "Organisation updated successfully",
      organisation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error updating organisation",
      error,
    });
  }
};

//EXPORT
module.exports = {
  getDonarsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonarController,
  updateDonarController,
  updateHospitalController,
  updateOrgController,
};
