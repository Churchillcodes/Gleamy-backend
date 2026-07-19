const Product = require("../models/Product");
const Order = require("../models/Order");
const Lead = require("../models/Lead");
const handleControllerError = require("../utils/handleControllerError");

//Dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      archivedProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalLeads,
      newLeads,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),

      Product.countDocuments({
        quantity: { $lte: 5 },
        isActive: true,
        isMadeToOrder: false,
      }),

      Order.countDocuments(),

      Order.countDocuments({ status: "Pending" }),

      Order.countDocuments({ status: "Confirmed" }),

      Order.countDocuments({ status: "Delivered" }),

      Order.countDocuments({ status: "Cancelled" }),

      Lead.countDocuments(),

      Lead.countDocuments({ status: "New" }),
    ]);

    res.status(200).json({
      totalProducts,
      activeProducts,
      archivedProducts,
      lowStockProducts,

      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,

      totalLeads,
      newLeads,
    });
  } catch (err) {
    return handleControllerError(err, res);
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
    return handleControllerError(err, res);
  }
};

// Lead Analytics
const getLeadAnalytics = async (req, res) => {
  try {
    const leads = await Lead.find();

    const totalLeads = leads.length;

    const sourceCounts = {};

    leads.forEach((lead) => {
      sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
    });

    const leadSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const topSource =
      leadSources.length > 0 ? leadSources[0].source : "No leads yet";

    res.status(200).json({
      totalLeads,
      topSource,
      leadSources,
    });
  } catch (err) {
    return handleControllerError(err, res);
  }
};
module.exports = {
  getDashboardSummary,
  getRevenueAnalytics,
  getLeadAnalytics,
};
