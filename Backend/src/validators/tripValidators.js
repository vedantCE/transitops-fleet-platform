const { z } = require("zod");

const TRIP_STATUSES = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];

const createTripSchema = z.object({
  source: z.string().trim().min(1, "Source is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  vehicleId: z.string().trim().min(1, "vehicleId is required"),
  driverId: z.string().trim().min(1, "driverId is required"),
  cargoWeight: z.coerce.number().positive("Cargo weight must be greater than 0"),
  plannedDistance: z.coerce
    .number()
    .positive("Planned distance must be greater than 0"),
});

const completeTripSchema = z.object({
  finalOdometer: z.coerce
    .number()
    .nonnegative("Final odometer cannot be negative"),
  fuelConsumed: z.coerce
    .number()
    .nonnegative("Fuel consumed cannot be negative"),
});

const tripQuerySchema = z.object({
  status: z.enum(TRIP_STATUSES).optional(),
  vehicleId: z.string().trim().min(1).optional(),
  driverId: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["createdAt", "dispatchedAt", "completedAt", "plannedDistance"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  createTripSchema,
  completeTripSchema,
  tripQuerySchema,
  TRIP_STATUSES,
};
