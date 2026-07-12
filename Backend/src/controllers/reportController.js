const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// REVENUE RATE PER KILOMETER ($2.50)
const REVENUE_RATE_PER_KM = 2.50;

/**
 * GET /api/reports/kpis
 * Computes dashboard aggregate metrics.
 * RBAC: All authenticated users.
 */
const getKPIs = asyncHandler(async (req, res) => {
  const [
    vehicleCounts,
    tripCounts,
    driversOnDutyCount,
    totalVehicles,
  ] = await Promise.all([
    // Counts for each vehicle status
    prisma.vehicle.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // Counts for each trip status
    prisma.trip.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // Count of drivers on duty (AVAILABLE or ON_TRIP)
    prisma.driver.count({
      where: {
        status: { in: ["AVAILABLE", "ON_TRIP"] },
      },
    }),
    // Total count of registered vehicles
    prisma.vehicle.count(),
  ]);

  // Map vehicle counts by status
  const vehMap = { AVAILABLE: 0, ON_TRIP: 0, IN_SHOP: 0, RETIRED: 0 };
  vehicleCounts.forEach((item) => {
    vehMap[item.status] = item._count.id;
  });

  // Map trip counts by status
  const tripMap = { DRAFT: 0, DISPATCHED: 0, COMPLETED: 0, CANCELLED: 0 };
  tripCounts.forEach((item) => {
    tripMap[item.status] = item._count.id;
  });

  // Fleet Utilization (%) = (Vehicles ON_TRIP / Total Registered Vehicles) * 100
  const fleetUtilization = totalVehicles > 0
    ? (vehMap.ON_TRIP / totalVehicles) * 100
    : 0;

  res.json({
    success: true,
    data: {
      activeVehicles: vehMap.ON_TRIP,
      availableVehicles: vehMap.AVAILABLE,
      vehiclesInMaintenance: vehMap.IN_SHOP,
      activeTrips: tripMap.DISPATCHED,
      pendingTrips: tripMap.DRAFT,
      driversOnDuty: driversOnDutyCount,
      fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
    },
  });
});

/**
 * Helper to compute stats for a single vehicle.
 */
const calculateVehicleStats = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    return null;
  }

  const [
    maintenanceSum,
    fuelSum,
    expenseSum,
    completedTrips,
  ] = await Promise.all([
    // 1. Total Maintenance Cost
    prisma.maintenanceLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    }),
    // 2. Total Fuel Cost & Total Fuel Liters
    prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true, liters: true },
    }),
    // 3. Total Non-Maintenance Expenses
    prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true },
    }),
    // 4. Completed trips distance to compute Revenue and Fuel Efficiency
    prisma.trip.findMany({
      where: {
        vehicleId,
        status: "COMPLETED",
      },
      select: {
        actualDistance: true,
      },
    }),
  ]);

  const totalMaintenanceCost = maintenanceSum._sum.cost || 0;
  const totalFuelCost = fuelSum._sum.cost || 0;
  const totalFuelLiters = fuelSum._sum.liters || 0;
  const totalExpensesCost = expenseSum._sum.amount || 0;

  const totalOperationalCost = totalMaintenanceCost + totalFuelCost + totalExpensesCost;

  // Compute total distance of completed trips
  const totalDistance = completedTrips.reduce((acc, trip) => {
    return acc + (trip.actualDistance || 0);
  }, 0);

  // Fuel Efficiency (Distance / Liters)
  const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;

  // Dynamic Revenue calculation (Option A: $2.50 per km)
  const revenue = totalDistance * REVENUE_RATE_PER_KM;

  // Vehicle ROI = (Revenue - Operational Cost) / Acquisition Cost
  const roi = vehicle.acquisitionCost > 0
    ? (revenue - totalOperationalCost) / vehicle.acquisitionCost
    : 0;

  return {
    vehicleId: vehicle.id,
    registrationNumber: vehicle.registrationNumber,
    name: vehicle.name,
    type: vehicle.type,
    acquisitionCost: vehicle.acquisitionCost,
    totalDistance,
    totalMaintenanceCost,
    totalFuelCost,
    totalFuelLiters,
    totalExpensesCost,
    totalOperationalCost,
    fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
    revenue,
    roi: parseFloat(roi.toFixed(4)),
  };
};

/**
 * GET /api/reports/vehicles/:id/stats
 * Returns single vehicle operational analytics.
 * RBAC: All authenticated users.
 */
const getVehicleStats = asyncHandler(async (req, res) => {
  const stats = await calculateVehicleStats(req.params.id);
  if (!stats) {
    throw new AppError("Vehicle not found", 404);
  }

  res.json({
    success: true,
    data: { stats },
  });
});

/**
 * GET /api/reports/export
 * Exports all vehicle operational metrics as CSV.
 * RBAC: FLEET_MANAGER, FINANCIAL_ANALYST.
 */
const exportCSV = asyncHandler(async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true },
  });

  const statsList = [];
  for (const v of vehicles) {
    const s = await calculateVehicleStats(v.id);
    if (s) {
      statsList.push(s);
    }
  }

  // Generate CSV rows
  const headers = [
    "Vehicle ID",
    "Registration Number",
    "Name",
    "Type",
    "Acquisition Cost ($)",
    "Total Completed Distance (km)",
    "Total Maintenance Cost ($)",
    "Total Fuel Cost ($)",
    "Total Fuel (Liters)",
    "Total Expenses Cost ($)",
    "Total Operational Cost ($)",
    "Fuel Efficiency (km/L)",
    "Est. Revenue ($)",
    "ROI"
  ];

  const csvRows = [headers.join(",")];

  statsList.forEach((s) => {
    const row = [
      s.vehicleId,
      `"${s.registrationNumber}"`,
      `"${s.name}"`,
      `"${s.type}"`,
      s.acquisitionCost,
      s.totalDistance,
      s.totalMaintenanceCost,
      s.totalFuelCost,
      s.totalFuelLiters,
      s.totalExpensesCost,
      s.totalOperationalCost,
      s.fuelEfficiency,
      s.revenue,
      s.roi
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="fleet_report.csv"');
  res.status(200).send(csvContent);
});

module.exports = {
  getKPIs,
  getVehicleStats,
  exportCSV,
};
