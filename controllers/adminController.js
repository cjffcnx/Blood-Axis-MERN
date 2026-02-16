const userModel = require("../models/userModel");

//GET DONAR LIST
const getDonarsListController = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
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

    const donarData = await userModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: donarData.length,
      message: "Donar List Fetched Successfully",
      donarData,
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
    const { hospitalName, email, phone, address, website, isAvailable } = req.body;

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
    const { organisationName, email, phone, address, website, isAvailable } = req.body;

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
