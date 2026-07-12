const { z } = require("zod");

const MAINTENANCE_STATUSES = ["ACTIVE", "CLOSED"];

// POST /api/maintenance — body schema
const createMaintenanceSchema = z.object({
  vehicleId: z.string().trim().min(1, "vehicleId is required"),
  description: z.string().trim().min(1, "Description is required"),
  cost: z.coerce
    .number()
    .nonnegative("Cost cannot be negative")
    .optional()
    .default(0),
});

// GET /api/maintenance — query schema
const maintenanceQuerySchema = z.object({
  status: z.enum(MAINTENANCE_STATUSES).optional(),
  vehicleId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["createdAt", "startDate", "endDate", "cost"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  createMaintenanceSchema,
  maintenanceQuerySchema,
  MAINTENANCE_STATUSES,
};
