const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createDriver = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.create({ data: req.body });
  res.status(201).json({ success: true, data: { driver } });
});

const getDrivers = asyncHandler(async (req, res) => {
  const {
    status,
    licenseCategory,
    search,
    dispatchable,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.validatedQuery;

  const where = {
    ...(status && { status }),
    ...(licenseCategory && { licenseCategory }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { licenseNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(dispatchable && {
      status: "AVAILABLE",
      licenseExpiryDate: { gt: new Date() },
    }),
  };

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.driver.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      drivers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getDriverById = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.params.id },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  res.json({ success: true, data: { driver } });
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.params.id },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  if (driver.status === "ON_TRIP") {
    throw new AppError(
      "Cannot manually edit a driver while they are on trip",
      409
    );
  }

  const updated = await prisma.driver.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: { driver: updated } });
});

const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.params.id },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  if (driver.status === "ON_TRIP") {
    throw new AppError("Cannot delete a driver while they are on trip", 409);
  }

  await prisma.driver.delete({ where: { id: req.params.id } });

  res.json({ success: true, data: null });
});

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
};
