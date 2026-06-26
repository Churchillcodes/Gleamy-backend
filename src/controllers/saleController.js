const Sale = require("../models/Sale");

// get all sales
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ saleDate: -1 });

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// get single sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    res.status(200).json(sale);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
};
