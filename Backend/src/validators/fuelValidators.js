const { z } = require("zod");

const createFuelLogSchema = z.object({
  vehicleId: z.string().trim().min(1, "vehicleId is required"),
  tripId: z.string().trim().min(1).optional().nullable(),
  liters: z.coerce.number().positive("Liters must be greater than 0"),
  cost: z.coerce.number().nonnegative("Cost cannot be negative"),
  date: z.string().datetime({ message: "Invalid date format" }).optional().or(z.date().optional()),
});

const fuelLogQuerySchema = z.object({
  vehicleId: z.string().trim().min(1).optional(),
  tripId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["createdAt", "date", "liters", "cost"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  createFuelLogSchema,
  fuelLogQuerySchema,
};
