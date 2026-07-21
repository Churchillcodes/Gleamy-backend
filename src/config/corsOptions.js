// Comma-separated list in env, e.g.:
// ALLOWED_ORIGINS=https://gleamyfurniture.co.ke,https://www.gleamyfurniture.co.ke,https://gleamy.netlify.app
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const defaultDevOrigins = ["http://localhost:5173"];

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? envOrigins
    : [...defaultDevOrigins, ...envOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
