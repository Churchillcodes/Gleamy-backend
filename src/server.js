require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/dbConn");

const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

let server;

// Wait for database connection before opening the server to traffic
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`),
  );
});

// Catch anything that slips past try/catch in controllers
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Exit after logging — an uncaught exception means state may be corrupted.
  // Railway will automatically restart the process.
  process.exit(1);
});

// Graceful shutdown — Railway sends SIGTERM on every redeploy/restart
const shutdown = (signal) => {
  console.log(`${signal} received: closing server gracefully`);
  if (server) {
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
