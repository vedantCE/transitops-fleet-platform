const express = require("express");
const {
  getKPIs,
  getVehicleStats,
  exportCSV,
} = require("../controllers/reportController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/kpis", getKPIs);
router.get("/vehicles/:id/stats", getVehicleStats);
router.get("/export", restrictTo("FLEET_MANAGER", "FINANCIAL_ANALYST"), exportCSV);

module.exports = router;
