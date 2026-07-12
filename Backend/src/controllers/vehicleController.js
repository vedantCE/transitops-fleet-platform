const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.create({ data: req.body });
  res.status(201).json({ success: true, data: { vehicle } });
});

const getVehicles = asyncHandler(async (req, res) => {
  const {
    status,
    type,
    region,
    search,
    dispatchable,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.validatedQuery;

  const where = {
    ...(status && { status }),
    ...(type && { type }),
    ...(region && { region }),
    ...(dispatchable && { status: "AVAILABLE" }),
    ...(search && {
      OR: [
        { registrationNumber: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  res.json({ success: true, data: { vehicle } });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  if (vehicle.status === "ON_TRIP") {
    throw new AppError(
      "Cannot manually edit a vehicle while it is on trip",
      409
    );
  }

  const updated = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: { vehicle: updated } });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  if (vehicle.status === "ON_TRIP") {
    throw new AppError("Cannot delete a vehicle while it is on trip", 409);
  }

  await prisma.vehicle.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: null });
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};