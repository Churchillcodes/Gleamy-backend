const express = require("express");
const router = express.Router();

const {
  getAllSales,
  getSaleById,
  getTopProducts,
  getRevenueTrends,
  getSalesBreakdown,
  getCustomerHistory,
} = require("../controllers/saleController");

router.get("/analytics/top-products", getTopProducts);

router.get("/analytics/revenue-trends", getRevenueTrends);

router.get("/analytics/sales-breakdown", getSalesBreakdown);

router.get("/analytics/customer-history", getCustomerHistory);

router.get("/", getAllSales);
router.get("/:id", getSaleById);

module.exports = router;
