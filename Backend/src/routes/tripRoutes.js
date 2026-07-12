const express = require("express");
const {
  createTrip,
  getTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
} = require("../controllers/tripController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createTripSchema,
  completeTripSchema,
  tripQuerySchema,
} = require("../validators/tripValidators");

const router = express.Router();

const canManageTrips = restrictTo("DRIVER", "FLEET_MANAGER");

router.use(protect);

router
  .route("/")
  .get(validate(tripQuerySchema, "query"), getTrips)
  .post(canManageTrips, validate(createTripSchema), createTrip);

router.get("/:id", getTripById);
router.patch("/:id/dispatch", canManageTrips, dispatchTrip);
router.patch(
  "/:id/complete",
  canManageTrips,
  validate(completeTripSchema),
  completeTrip
);
router.patch("/:id/cancel", canManageTrips, cancelTrip);
router.delete("/:id", canManageTrips, deleteTrip);

module.exports = router;
