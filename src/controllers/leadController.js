const Lead = require("../models/Lead");
const handleControllerError = require("../utils/handleControllerError");

// Create Lead
const createLead = async (req, res) => {
  try {
    const { customerName, customerPhone, source, product, productName } =
      req.body;

    const lead = await Lead.create({
      customerName,
      customerPhone,
      source,
      product,
      productName,
    });

    res.status(201).json({
      message: "Lead captured successfully",
      lead,
    });
  } catch (err) {
    return handleControllerError(err, res);
  }
};

// Get All Leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .populate("product", "name");

    res.status(200).json(leads);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = {
  createLead,
  getAllLeads,
};
