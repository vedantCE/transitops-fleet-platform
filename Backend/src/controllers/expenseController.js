const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const expenseInclude = {
  vehicle: {
    select: { id: true, registrationNumber: true, name: true },
  },
  trip: {
    select: { id: true, source: true, destination: true },
  },
};

const createExpense = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, type, amount, description, date } = req.body;

  // Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  // Verify trip exists if provided
  if (tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new AppError("Trip not found", 404);
    }
  }

  const expense = await prisma.expense.create({
    data: {
      vehicleId,
      tripId: tripId || null,
      type,
      amount,
      description: description || null,
      date: date ? new Date(date) : undefined,
    },
    include: expenseInclude,
  });

  res.status(201).json({ success: true, data: { expense } });
});

const getExpenses = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, type, page, limit, sortBy, sortOrder } = req.validatedQuery;

  const where = {
    ...(vehicleId && { vehicleId }),
    ...(tripId && { tripId }),
    ...(type && { type: { contains: type, mode: "insensitive" } }),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: expenseInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
    include: expenseInclude,
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  res.json({ success: true, data: { expense } });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  await prisma.expense.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: null });
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  deleteExpense,
};
