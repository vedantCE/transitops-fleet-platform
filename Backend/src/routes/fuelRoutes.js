const express = require("express");
const {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  deleteFuelLog,
} = require("../controllers/fuelController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createFuelLogSchema,
  fuelLogQuerySchema,
} = require("../validators/fuelValidators");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(validate(fuelLogQuerySchema, "query"), getFuelLogs)
  .post(
    restrictTo("FLEET_MANAGER", "DRIVER"),
    validate(createFuelLogSchema),
    createFuelLog
  );

router
  .route("/:id")
  .get(getFuelLogById)
  .delete(restrictTo("FLEET_MANAGER"), deleteFuelLog);

module.exports = router;
