const Order = require("../models/Order");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const normalizeText = require("../utils/normalizeText");
const handleControllerError = require("../utils/handleControllerError");
//creating an order
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerLocation,
      product,
      quantity,
      agreedPrice,
      notes,
      customRequirements,
    } = req.body;

    if (!product) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const existingProduct = await Product.findById(product);

    if (!existingProduct || !existingProduct.isActive) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const listedPrice = existingProduct.listedPrice;

    const orderType = existingProduct.isMadeToOrder
      ? "Custom Order"
      : "Inventory Sale";

    if (orderType === "Inventory Sale") {
      if (
        !existingProduct.isMadeToOrder &&
        existingProduct.quantity < quantity
      ) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }
    }
    const order = await Order.create({
      customerName,
      customerPhone,
      product,
      quantity,
      listedPrice,
      agreedPrice,
      orderType,
      customRequirements,
      customerLocation,
      notes,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    return handleControllerError(err, res);
  }
};

//getting all orders
const getAllOrders = async (req, res) => {
  try {
    const { status, orderType } = req.query;

    const filter = {};

    if (status) {
      filter.status = normalizeText(status);
    }

    if (orderType) {
      filter.orderType = normalizeText(orderType);
    }

    const orders = await Order.find(filter)
      .populate("product", "name listedPrice")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

//get an order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "product",
      "name listedPrice category",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

//updating our order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "In Production",
      "Ready",
      "Delivered",
      "Cancelled",
    ];
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    status = normalizeText(status);

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: `Order is already ${order.status}`,
      });
    }

    const product = await Product.findById(order.product);

    if (!product) {
      return res.status(404).json({
        message: "Associated product not found",
      });
    }

    let validTransitions;

    if (order.orderType === "Inventory Sale") {
      validTransitions = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Ready", "Cancelled"],
        Ready: ["Delivered", "Cancelled"],
        Delivered: [],
        Cancelled: [],
      };
    } else {
      validTransitions = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["In Production", "Cancelled"],
        "In Production": ["Ready"],
        Ready: ["Delivered"],
        Delivered: [],
        Cancelled: [],
      };
    }

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot move from ${order.status} to ${status}`,
      });
    }

    /*
  Confirmed/Ready -> Cancelled
  Return reserved inventory to stock
*/
    if (
      order.status === "Pending" &&
      status === "Confirmed" &&
      !product.isMadeToOrder
    ) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          quantity: { $gte: order.quantity },
        },
        {
          $inc: { quantity: -order.quantity },
        },
        {
          returnDocument: "after",
        },
      );

      if (!updatedProduct) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }
    }

    if (
      ["Confirmed", "Ready"].includes(order.status) &&
      status === "Cancelled" &&
      !product.isMadeToOrder
    ) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: {
          quantity: order.quantity,
        },
      });
    }

    /*
  READY -> DELIVERED
  Create permanent sales record
*/
    if (order.status === "Ready" && status === "Delivered") {
      const existingSale = await Sale.findOne({
        order: order._id,
      });

      if (!existingSale) {
        await Sale.create({
          order: order._id,
          product: product._id,

          productName: product.name,

          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerLocation: order.customerLocation,

          quantity: order.quantity,

          listedPrice: order.listedPrice,
          agreedPrice: order.agreedPrice,

          totalAmount: order.quantity * order.agreedPrice,

          orderType: order.orderType,

          saleDate: new Date(),
        });
      }
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    return handleControllerError(err, res);
  }
};

//cancelling an order
const cancelOrder = async (req, res) => {
  try {
    req.body = {
      ...(req.body || {}),
      status: "Cancelled",
    };

    return updateOrderStatus(req, res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
