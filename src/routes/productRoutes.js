const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  getLowStockProducts,
  deleteProductById,
  updateProductById,
  getArchivedProducts,
  restoreProduct,
  increaseStock,
  reduceStock,
} = require("../controllers/productController");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");

router.get("/", getAllProducts);
router.get(
  "/archived",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getArchivedProducts,
);

router.get(
  "/low-stock",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  getLowStockProducts,
);

router.get("/:id", getProductById);

router.post("/", verifyJWT, verifyRoles(ROLES_LIST.Admin), createProduct);

router.patch(
  "/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  updateProductById,
);

router.patch(
  "/:id/restore",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  restoreProduct,
);

router.patch(
  "/:id/increase-stock",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  increaseStock,
);

router.patch(
  "/:id/reduce-stock",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  reduceStock,
);

router.delete(
  "/:id",
  verifyJWT,
  verifyRoles(ROLES_LIST.Admin),
  deleteProductById,
);

module.exports = router;
