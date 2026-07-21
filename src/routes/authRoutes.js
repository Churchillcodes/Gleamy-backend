const express = require("express");
const router = express.Router();

const {
  handleNewUser,
  handleNewLogin,
  handleRefreshToken,
  handleLogout,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, handleNewUser);
router.post("/login", authLimiter, handleNewLogin);
router.get("/refresh", handleRefreshToken);
router.post("/logout", handleLogout);

module.exports = router;
