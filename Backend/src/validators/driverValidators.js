const { z } = require("zod");

const DRIVER_STATUSES = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];
// Manual create/update never sets ON_TRIP directly — that transition is owned
// by trip dispatch/completion in Phase 5.
const MANUAL_DRIVER_STATUSES = ["AVAILABLE", "OFF_DUTY", "SUSPENDED"];

const createDriverSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  licenseNumber: z.string().trim().min(1, "License number is required"),
  licenseCategory: z.string().trim().min(1, "License category is required"),
  licenseExpiryDate: z.coerce.date({
    message: "License expiry date must be a valid date",
  }),
  contactNumber: z.string().trim().min(1, "Contact number is required"),
  safetyScore: z.coerce
    .number()
    .min(0, "Safety score cannot be negative")
    .max(100, "Safety score cannot exceed 100")
    .optional()
    .default(100),
  status: z
    .enum(MANUAL_DRIVER_STATUSES, {
      message: `Status must be one of: ${MANUAL_DRIVER_STATUSES.join(", ")}`,
    })
    .optional()
    .default("AVAILABLE"),
});

const updateDriverSchema = createDriverSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

const driverQuerySchema = z.object({
  status: z.enum(DRIVER_STATUSES).optional(),
  licenseCategory: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  dispatchable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["createdAt", "name", "licenseExpiryDate", "safetyScore"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  driverQuerySchema,
  DRIVER_STATUSES,
  MANUAL_DRIVER_STATUSES,
};
