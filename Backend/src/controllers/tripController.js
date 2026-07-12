const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const tripInclude = {
  vehicle: {
    select: { id: true, registrationNumber: true, name: true, status: true },
  },
  driver: {
    select: { id: true, name: true, licenseNumber: true, status: true },
  },
};

const assertVehicleDispatchable = (vehicle, cargoWeight) => {
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  if (vehicle.status !== "AVAILABLE") {
    throw new AppError(
      `Vehicle is not available for dispatch (current status: ${vehicle.status})`,
      409
    );
  }
  if (cargoWeight > vehicle.maxLoadCapacity) {
    throw new AppError(
      `Cargo weight (${cargoWeight}kg) exceeds vehicle's maximum load capacity (${vehicle.maxLoadCapacity}kg)`,
      400
    );
  }
};

const assertDriverDispatchable = (driver) => {
  if (!driver) {
    throw new AppError("Driver not found", 404);
  }
  if (driver.status !== "AVAILABLE") {
    throw new AppError(
      `Driver is not available for dispatch (current status: ${driver.status})`,
      409
    );
  }
  if (driver.licenseExpiryDate < new Date()) {
    throw new AppError("Driver's license has expired", 409);
  }
};

const createTrip = asyncHandler(async (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } =
    req.body;

  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);

  assertVehicleDispatchable(vehicle, cargoWeight);
  assertDriverDispatchable(driver);

  const trip = await prisma.trip.create({
    data: {
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
    },
    include: tripInclude,
  });

  res.status(201).json({ success: true, data: { trip } });
});

const getTrips = asyncHandler(async (req, res) => {
  const { status, vehicleId, driverId, search, page, limit, sortBy, sortOrder } =
    req.validatedQuery;

  const where = {
    ...(status && { status }),
    ...(vehicleId && { vehicleId }),
    ...(driverId && { driverId }),
    ...(search && {
      OR: [
        { source: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      include: tripInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      trips,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});

const getTripById = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: tripInclude,
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  res.json({ success: true, data: { trip } });
});

const dispatchTrip = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: { vehicle: true, driver: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }
  if (trip.status !== "DRAFT") {
    throw new AppError(
      `Only a Draft trip can be dispatched (current status: ${trip.status})`,
      409
    );
  }

  // Re-validate against current state — availability may have changed since
  // the trip was created as a Draft (e.g. vehicle/driver taken by another trip).
  assertVehicleDispatchable(trip.vehicle, trip.cargoWeight);
  assertDriverDispatchable(trip.driver);

  // Vehicle/driver updates run first so the trip's nested include below
  // reflects their post-transaction status, not their pre-dispatch snapshot.
  const [, , updatedTrip] = await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "ON_TRIP" },
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "ON_TRIP" },
    }),
    prisma.trip.update({
      where: { id: trip.id },
      data: { status: "DISPATCHED", dispatchedAt: new Date() },
      include: tripInclude,
    }),
  ]);

  res.json({ success: true, data: { trip: updatedTrip } });
});

const completeTrip = asyncHandler(async (req, res) => {
  const { finalOdometer, fuelConsumed } = req.body;

  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: { vehicle: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }
  if (trip.status !== "DISPATCHED") {
    throw new AppError(
      `Only a Dispatched trip can be completed (current status: ${trip.status})`,
      409
    );
  }
  if (finalOdometer <= trip.vehicle.odometer) {
    throw new AppError(
      `Final odometer (${finalOdometer}) must be greater than the vehicle's current odometer (${trip.vehicle.odometer})`,
      400
    );
  }

  const actualDistance = finalOdometer - trip.vehicle.odometer;

  const [, , updatedTrip] = await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "AVAILABLE", odometer: finalOdometer },
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    }),
    prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        actualDistance,
        fuelConsumed,
      },
      include: tripInclude,
    }),
  ]);

  res.json({ success: true, data: { trip: updatedTrip } });
});

const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }
  if (trip.status !== "DRAFT" && trip.status !== "DISPATCHED") {
    throw new AppError(
      `Only a Draft or Dispatched trip can be cancelled (current status: ${trip.status})`,
      409
    );
  }

  const wasDispatched = trip.status === "DISPATCHED";

  const results = await prisma.$transaction([
    ...(wasDispatched
      ? [
          prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: "AVAILABLE" },
          }),
          prisma.driver.update({
            where: { id: trip.driverId },
            data: { status: "AVAILABLE" },
          }),
        ]
      : []),
    prisma.trip.update({
      where: { id: trip.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: tripInclude,
    }),
  ]);

  const updatedTrip = results[results.length - 1];

  res.json({ success: true, data: { trip: updatedTrip } });
});

const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }
  if (trip.status !== "DRAFT") {
    throw new AppError("Only a Draft trip can be deleted", 409);
  }

  await prisma.trip.delete({ where: { id: trip.id } });

  res.json({ success: true, data: null });
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
};
