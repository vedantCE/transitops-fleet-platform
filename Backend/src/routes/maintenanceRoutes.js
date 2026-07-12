const express = require("express");
const {
  createMaintenance,
  getMaintenanceLogs,
  getMaintenanceById,
  closeMaintenance,
} = require("../controllers/maintenanceController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createMaintenanceSchema,
  maintenanceQuerySchema,
} = require("../validators/maintenanceValidators");

const router = express.Router();

// All maintenance routes require authentication
router.use(protect);

// GET /api/maintenance         — all authenticated users
// POST /api/maintenance        — FLEET_MANAGER only
router
  .route("/")
  .get(validate(maintenanceQuerySchema, "query"), getMaintenanceLogs)
  .post(
    restrictTo("FLEET_MANAGER"),
    validate(createMaintenanceSchema),
    createMaintenance
  );

// GET /api/maintenance/:id     — all authenticated users
router.get("/:id", getMaintenanceById);

// PATCH /api/maintenance/:id/close  — FLEET_MANAGER only
// No request body required — no body validation middleware needed
router.patch("/:id/close", restrictTo("FLEET_MANAGER"), closeMaintenance);

module.exports = router;
