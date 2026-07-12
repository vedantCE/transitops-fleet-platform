const express = require("express");
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
} = require("../validators/vehicleValidators");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(validate(vehicleQuerySchema, "query"), getVehicles)
  .post(restrictTo("FLEET_MANAGER"), validate(createVehicleSchema), createVehicle);

router
  .route("/:id")
  .get(getVehicleById)
  .patch(
    restrictTo("FLEET_MANAGER"),
    validate(updateVehicleSchema),
    updateVehicle
  )
  .delete(restrictTo("FLEET_MANAGER"), deleteVehicle);

module.exports = router;