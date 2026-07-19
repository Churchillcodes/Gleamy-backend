const Sale = require("../models/Sale");
const handleControllerError = require("../utils/handleControllerError");

// get all sales
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ saleDate: -1 });

    res.status(200).json(sales);
  } catch (err) {
    return handleControllerError(err, res);
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
    return handleControllerError(err, res);
  }
};

//ANALYTICS
//getting top products
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$productName",

          unitsSold: {
            $sum: "$quantity",
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,
          productName: "$_id",
          unitsSold: 1,
          revenue: 1,
        },
      },

      {
        $sort: {
          unitsSold: -1,
          revenue: -1,
        },
      },
    ]);

    res.status(200).json(topProducts);
  } catch (err) {
    return handleControllerError(err, res);
  }
};
//getting revenue trends
const getRevenueTrends = async (req, res) => {
  try {
    const trends = await Sale.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$saleDate",
            },

            month: {
              $month: "$saleDate",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const formattedTrends = trends.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: item.revenue,
    }));

    res.status(200).json(formattedTrends);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

//getting sales breakdown BY PRODUCT CATEGORY (Baby Furniture / Storage
//Furniture / Living Room Furniture) — this answers "which furniture line
//drives our revenue", which is what the admin UI's "Category Demand Split"
//section is meant to show. Sale documents don't store category directly
//(only a productName snapshot), so we $lookup into the Products collection
//via the `product` ref to pull it in.
const getSalesBreakdown = async (req, res) => {
  try {
    const breakdown = await Sale.aggregate([
      {
        $lookup: {
          from: "products", // Mongoose pluralizes "Product" model -> "products" collection
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        // A sale's linked product should always exist (products are only ever
        // archived, never hard-deleted), but preserveNullAndEmptyArrays keeps
        // this endpoint from silently dropping a sale if that ever changes.
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$productInfo.category", "Uncategorized"] },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          revenue: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    // Returns an ARRAY of { category, count, revenue } — matches what the
    // frontend's AnalyticsPage.jsx already expects, no frontend change needed.
    res.status(200).json(breakdown);
  } catch (err) {
    return handleControllerError(err, res);
  }
};
//getting customer history
const getCustomerHistory = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const sales = await Sale.find({
      customerPhone: phone,
    }).sort({
      saleDate: -1,
    });

    if (sales.length === 0) {
      return res.status(404).json({
        message: "No sales found for this customer",
      });
    }

    const totalSpent = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    res.status(200).json({
      customerName: sales[0].customerName,
      customerPhone: phone,

      totalPurchases: sales.length,

      totalSpent,

      purchases: sales,
    });
  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  getTopProducts,
  getRevenueTrends,
  getSalesBreakdown,
  getCustomerHistory,
};
