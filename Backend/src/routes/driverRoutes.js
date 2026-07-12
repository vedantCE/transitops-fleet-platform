const express = require("express");
const {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createDriverSchema,
  updateDriverSchema,
  driverQuerySchema,
} = require("../validators/driverValidators");

const router = express.Router();

const canManageDrivers = restrictTo("FLEET_MANAGER", "SAFETY_OFFICER");

router.use(protect);

router
  .route("/")
  .get(validate(driverQuerySchema, "query"), getDrivers)
  .post(canManageDrivers, validate(createDriverSchema), createDriver);

router
  .route("/:id")
  .get(getDriverById)
  .patch(canManageDrivers, validate(updateDriverSchema), updateDriver)
  .delete(canManageDrivers, deleteDriver);

module.exports = router;
