const { z } = require("zod");

const VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];
// Manual create/update never sets ON_TRIP directly — that transition is owned
// by trip dispatch/completion in Phase 5.
const MANUAL_VEHICLE_STATUSES = ["AVAILABLE", "IN_SHOP", "RETIRED"];

const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required"),
  name: z.string().trim().min(1, "Vehicle name/model is required"),
  type: z.string().trim().min(1, "Vehicle type is required"),
  maxLoadCapacity: z.coerce
    .number()
    .positive("Maximum load capacity must be greater than 0"),
  odometer: z.coerce
    .number()
    .nonnegative("Odometer cannot be negative")
    .optional()
    .default(0),
  acquisitionCost: z.coerce
    .number()
    .positive("Acquisition cost must be greater than 0"),
  status: z
    .enum(MANUAL_VEHICLE_STATUSES, {
      message: `Status must be one of: ${MANUAL_VEHICLE_STATUSES.join(", ")}`,
    })
    .optional()
    .default("AVAILABLE"),
  region: z.string().trim().min(1).optional(),
});

const updateVehicleSchema = createVehicleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

const vehicleQuerySchema = z.object({
  status: z.enum(VEHICLE_STATUSES).optional(),
  type: z.string().trim().min(1).optional(),
  region: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  dispatchable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["createdAt", "name", "registrationNumber", "odometer", "acquisitionCost"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
  VEHICLE_STATUSES,
  MANUAL_VEHICLE_STATUSES,
};