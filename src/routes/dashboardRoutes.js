const express = require("express");
const router = express.Router();

const {
  getDashboardSummary,
  getRevenueAnalytics,
} = require("../controllers/dashboardController");

router.get("/summary", getDashboardSummary);
router.get("/revenue", getRevenueAnalytics);

module.exports = router;
