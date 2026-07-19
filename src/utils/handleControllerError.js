const handleControllerError = (err, res) => {
  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    return res.status(409).json({
      message: `${field} already exists`,
    });
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((error) => error.message);

    return res.status(400).json({
      message: messages.join(", "),
    });
  }

  // Invalid Mongo ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Internal server error",
  });
};

module.exports = handleControllerError;
