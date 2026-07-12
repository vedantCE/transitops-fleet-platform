const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// ---------------------------------------------------------------------------
// Reusable include shape for maintenance responses
// ---------------------------------------------------------------------------
const maintenanceInclude = {
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      name: true,
      status: true,
    },
  },
};

// ---------------------------------------------------------------------------
// POST /api/maintenance
// RBAC: FLEET_MANAGER only
// ---------------------------------------------------------------------------
const createMaintenance = asyncHandler(async (req, res) => {
  const { vehicleId, description, cost } = req.body;

  // BR-1: Vehicle must exist
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  // BR-2: Vehicle cannot be ON_TRIP
  if (vehicle.status === "ON_TRIP") {
    throw new AppError(
      "Vehicle cannot enter maintenance while on trip",
      409
    );
  }

  // BR-3: Vehicle cannot be RETIRED
  if (vehicle.status === "RETIRED") {
    throw new AppError(
      "Retired vehicles cannot enter maintenance",
      409
    );
  }

  // BR-4: Vehicle already IN_SHOP means there is an active maintenance record
  if (vehicle.status === "IN_SHOP") {
    throw new AppError(
      "Vehicle already has an active maintenance record",
      409
    );
  }

  // BR-5: Transaction — update vehicle to IN_SHOP first, then create log
  const [, maintenanceLog] = await prisma.$transaction([
    // Step 1: set vehicle IN_SHOP
    prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "IN_SHOP" },
    }),
    // Step 2: create the maintenance log (ACTIVE by default per schema)
    prisma.maintenanceLog.create({
      data: {
        vehicleId,
        description,
        cost,
        // status defaults to ACTIVE in schema
      },
      include: maintenanceInclude,
    }),
  ]);

  res.status(201).json({ success: true, data: { maintenanceLog } });
});

// ---------------------------------------------------------------------------
// GET /api/maintenance
// RBAC: all authenticated users
// ---------------------------------------------------------------------------
const getMaintenanceLogs = asyncHandler(async (req, res) => {
  const { status, vehicleId, page, limit, sortBy, sortOrder } =
    req.validatedQuery;

  const where = {
    ...(status && { status }),
    ...(vehicleId && { vehicleId }),
  };

  const [maintenanceLogs, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where,
      include: maintenanceInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      maintenanceLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// ---------------------------------------------------------------------------
// GET /api/maintenance/:id
// RBAC: all authenticated users
// ---------------------------------------------------------------------------
const getMaintenanceById = asyncHandler(async (req, res) => {
  const maintenanceLog = await prisma.maintenanceLog.findUnique({
    where: { id: req.params.id },
    include: maintenanceInclude,
  });

  if (!maintenanceLog) {
    throw new AppError("Maintenance record not found", 404);
  }

  res.json({ success: true, data: { maintenanceLog } });
});

// ---------------------------------------------------------------------------
// PATCH /api/maintenance/:id/close
// RBAC: FLEET_MANAGER only
// ---------------------------------------------------------------------------
const closeMaintenance = asyncHandler(async (req, res) => {
  // BR-6: Maintenance record must exist
  const maintenanceLog = await prisma.maintenanceLog.findUnique({
    where: { id: req.params.id },
  });

  if (!maintenanceLog) {
    throw new AppError("Maintenance record not found", 404);
  }

  // BR-7: Cannot close an already-closed record
  if (maintenanceLog.status === "CLOSED") {
    throw new AppError("Maintenance record is already closed", 409);
  }

  // BR-8: Determine new vehicle status
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: maintenanceLog.vehicleId },
  });

  // If vehicle is RETIRED, leave it RETIRED; otherwise restore AVAILABLE
  const newVehicleStatus = vehicle && vehicle.status === "RETIRED"
    ? "RETIRED"
    : "AVAILABLE";

  const now = new Date();

  // BR-9: Transaction — update vehicle first, then close the log
  const [, updatedLog] = await prisma.$transaction([
    // Step 1: update vehicle status
    prisma.vehicle.update({
      where: { id: maintenanceLog.vehicleId },
      data: { status: newVehicleStatus },
    }),
    // Step 2: close the maintenance log
    prisma.maintenanceLog.update({
      where: { id: maintenanceLog.id },
      data: {
        status: "CLOSED",
        endDate: now,
      },
      include: maintenanceInclude,
    }),
  ]);

  res.json({ success: true, data: { maintenanceLog: updatedLog } });
});

module.exports = {
  createMaintenance,
  getMaintenanceLogs,
  getMaintenanceById,
  closeMaintenance,
};
