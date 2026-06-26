const express = require("express");
const router = express.Router();

const { getAllSales, getSaleById } = require("../controllers/saleController");

router.get("/", getAllSales);
router.get("/:id", getSaleById);

module.exports = router;
