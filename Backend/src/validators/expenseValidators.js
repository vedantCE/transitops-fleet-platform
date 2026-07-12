const { z } = require("zod");

const createExpenseSchema = z.object({
  vehicleId: z.string().trim().min(1, "vehicleId is required"),
  tripId: z.string().trim().min(1).optional().nullable(),
  type: z.string().trim().min(1, "Expense type is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().trim().optional().nullable(),
  date: z.string().datetime({ message: "Invalid date format" }).optional().or(z.date().optional()),
});

const expenseQuerySchema = z.object({
  vehicleId: z.string().trim().min(1).optional(),
  tripId: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["createdAt", "date", "amount", "type"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

module.exports = {
  createExpenseSchema,
  expenseQuerySchema,
};
