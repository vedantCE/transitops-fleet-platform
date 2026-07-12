const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "TransitOps API is running" });
});

app.use("/api/auth", authRoutes);

// --- routes mount here (added phase by phase) ---

app.use(notFound);
app.use(errorHandler);

module.exports = app;
