const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const fuelLogInclude = {
  vehicle: {
    select: { id: true, registrationNumber: true, name: true },
  },
  trip: {
    select: { id: true, source: true, destination: true },
  },
};

const createFuelLog = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, liters, cost, date } = req.body;

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

  const fuelLog = await prisma.fuelLog.create({
    data: {
      vehicleId,
      tripId: tripId || null,
      liters,
      cost,
      date: date ? new Date(date) : undefined,
    },
    include: fuelLogInclude,
  });

  res.status(201).json({ success: true, data: { fuelLog } });
});

const getFuelLogs = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, page, limit, sortBy, sortOrder } = req.validatedQuery;

  const where = {
    ...(vehicleId && { vehicleId }),
    ...(tripId && { tripId }),
  };

  const [fuelLogs, total] = await Promise.all([
    prisma.fuelLog.findMany({
      where,
      include: fuelLogInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fuelLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      fuelLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getFuelLogById = asyncHandler(async (req, res) => {
  const fuelLog = await prisma.fuelLog.findUnique({
    where: { id: req.params.id },
    include: fuelLogInclude,
  });

  if (!fuelLog) {
    throw new AppError("Fuel log not found", 404);
  }

  res.json({ success: true, data: { fuelLog } });
});

const deleteFuelLog = asyncHandler(async (req, res) => {
  const fuelLog = await prisma.fuelLog.findUnique({
    where: { id: req.params.id },
  });

  if (!fuelLog) {
    throw new AppError("Fuel log not found", 404);
  }

  await prisma.fuelLog.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: null });
});

module.exports = {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  deleteFuelLog,
};
