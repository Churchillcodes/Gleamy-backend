const Product = require("../models/Product");
const Order = require("../models/Order");

//Dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      archivedProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),

      Order.countDocuments(),

      Order.countDocuments({ status: "Pending" }),

      Order.countDocuments({ status: "Confirmed" }),

      Order.countDocuments({ status: "Delivered" }),

      Order.countDocuments({ status: "Cancelled" }),
    ]);

    res.status(200).json({
      totalProducts,
      activeProducts,
      archivedProducts,

      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//Getting revenue analytics
const Sale = require("../models/Sale");

const getRevenueAnalytics = async (req, res) => {
  try {
    const sales = await Sale.find();

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayRevenue = sales
      .filter((sale) => sale.saleDate >= startOfToday)
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    const monthlyRevenue = sales
      .filter((sale) => sale.saleDate >= startOfMonth)
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    res.status(200).json({
      totalRevenue,
      monthlyRevenue,
      todayRevenue,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
module.exports = {
  getDashboardSummary,
  getRevenueAnalytics,
};
