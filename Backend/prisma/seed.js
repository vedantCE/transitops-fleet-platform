require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

// Non-destructive: upserts by unique key instead of wiping the database, so
// it's safe to re-run against a shared dev DB without clobbering other
// people's manual test data.
async function main() {
  const password = await bcrypt.hash("password123", 10);

  const [fleetManager, driverUser, safetyOfficer, financialAnalyst] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: "fleetmanager@transitops.com" },
        update: {},
        create: {
          name: "Fleet Manager",
          email: "fleetmanager@transitops.com",
          password,
          role: "FLEET_MANAGER",
        },
      }),
      prisma.user.upsert({
        where: { email: "driver@transitops.com" },
        update: {},
        create: {
          name: "Driver User",
          email: "driver@transitops.com",
          password,
          role: "DRIVER",
        },
      }),
      prisma.user.upsert({
        where: { email: "safetyofficer@transitops.com" },
        update: {},
        create: {
          name: "Safety Officer",
          email: "safetyofficer@transitops.com",
          password,
          role: "SAFETY_OFFICER",
        },
      }),
      prisma.user.upsert({
        where: { email: "analyst@transitops.com" },
        update: {},
        create: {
          name: "Financial Analyst",
          email: "analyst@transitops.com",
          password,
          role: "FINANCIAL_ANALYST",
        },
      }),
    ]);

  const [vehicleA, vehicleB, vehicleC, vehicleD] = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: "MH-12-AB-1234" },
      update: {},
      create: {
        registrationNumber: "MH-12-AB-1234",
        name: "Tata Ace Gold",
        type: "Van",
        maxLoadCapacity: 750,
        acquisitionCost: 850000,
        region: "West",
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "MH-12-CD-5678" },
      update: {},
      create: {
        registrationNumber: "MH-12-CD-5678",
        name: "Ashok Leyland Dost",
        type: "Truck",
        maxLoadCapacity: 1500,
        acquisitionCost: 1500000,
        region: "West",
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "MH-14-EF-9012" },
      update: {},
      create: {
        registrationNumber: "MH-14-EF-9012",
        name: "Mahindra Bolero Pickup",
        type: "Pickup",
        maxLoadCapacity: 1000,
        acquisitionCost: 900000,
        region: "North",
        status: "RETIRED",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "MH-14-GH-3456" },
      update: {},
      create: {
        registrationNumber: "MH-14-GH-3456",
        name: "Eicher Pro 2049",
        type: "Truck",
        maxLoadCapacity: 3000,
        acquisitionCost: 2200000,
        region: "North",
        status: "AVAILABLE",
      },
    }),
  ]);

  const [driverA, driverB, driverC, driverD] = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "DL-SEED-001" },
      update: {},
      create: {
        name: "Ramesh Kumar",
        licenseNumber: "DL-SEED-001",
        licenseCategory: "LMV",
        licenseExpiryDate: new Date("2027-06-01"),
        contactNumber: "9876543210",
        safetyScore: 92,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-SEED-002" },
      update: {},
      create: {
        name: "Suresh Patil",
        licenseNumber: "DL-SEED-002",
        licenseCategory: "HMV",
        licenseExpiryDate: new Date("2026-08-01"),
        contactNumber: "9876543211",
        safetyScore: 88,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-SEED-003" },
      update: {},
      create: {
        name: "Anita Sharma",
        licenseNumber: "DL-SEED-003",
        licenseCategory: "LMV",
        licenseExpiryDate: new Date("2024-01-01"), // expired — demonstrates the rule
        contactNumber: "9876543212",
        safetyScore: 95,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL-SEED-004" },
      update: {},
      create: {
        name: "Vikram Singh",
        licenseNumber: "DL-SEED-004",
        licenseCategory: "HMV",
        licenseExpiryDate: new Date("2027-01-01"),
        contactNumber: "9876543213",
        safetyScore: 60,
        status: "SUSPENDED", // demonstrates the rule
      },
    }),
  ]);

  // Trip/maintenance/fuel/expense history is only seeded once — guard on
  // whether vehicleA already has any trips so re-running seed doesn't pile
  // up duplicate demo history.
  const existingTripCount = await prisma.trip.count({
    where: { vehicleId: vehicleA.id },
  });

  if (existingTripCount === 0) {
    // Trip 1: completed — vehicle A + driver A, both back to AVAILABLE.
    const completedTrip = await prisma.trip.create({
      data: {
        source: "Mumbai Depot",
        destination: "Pune Warehouse",
        vehicleId: vehicleA.id,
        driverId: driverA.id,
        cargoWeight: 500,
        plannedDistance: 150,
        actualDistance: 155,
        fuelConsumed: 18,
        status: "COMPLETED",
        dispatchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicleA.id },
      data: { odometer: 155, status: "AVAILABLE" },
    });

    // Trip 2: dispatched (in progress) — vehicle B + driver B, both ON_TRIP.
    await prisma.trip.create({
      data: {
        source: "Pune Warehouse",
        destination: "Nashik Hub",
        vehicleId: vehicleB.id,
        driverId: driverB.id,
        cargoWeight: 1200,
        plannedDistance: 210,
        status: "DISPATCHED",
        dispatchedAt: new Date(),
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicleB.id },
      data: { status: "ON_TRIP" },
    });
    await prisma.driver.update({
      where: { id: driverB.id },
      data: { status: "ON_TRIP" },
    });

    // Trip 3: draft — vehicle A + driver A, awaiting dispatch.
    await prisma.trip.create({
      data: {
        source: "Mumbai Depot",
        destination: "Nagpur Hub",
        vehicleId: vehicleA.id,
        driverId: driverA.id,
        cargoWeight: 400,
        plannedDistance: 830,
        status: "DRAFT",
      },
    });

    // Trip 4: cancelled — historical, vehicle A + driver A.
    await prisma.trip.create({
      data: {
        source: "Mumbai Depot",
        destination: "Surat Yard",
        vehicleId: vehicleA.id,
        driverId: driverA.id,
        cargoWeight: 300,
        plannedDistance: 280,
        status: "CANCELLED",
        cancelledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    // Maintenance: one closed historical record on vehicle A.
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicleA.id,
        description: "Routine oil change",
        cost: 2500,
        status: "CLOSED",
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
    });

    // Maintenance: one active record on vehicle D — puts it IN_SHOP.
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicleD.id,
        description: "Brake pad replacement",
        cost: 8000,
        status: "ACTIVE",
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicleD.id },
      data: { status: "IN_SHOP" },
    });

    // Fuel log + expense tied to vehicle A's completed trip.
    await prisma.fuelLog.create({
      data: {
        vehicleId: vehicleA.id,
        tripId: completedTrip.id,
        liters: 18,
        cost: 1800,
      },
    });
    await prisma.expense.create({
      data: {
        vehicleId: vehicleA.id,
        tripId: completedTrip.id,
        type: "toll",
        amount: 250,
        description: "Mumbai-Pune expressway toll",
      },
    });
  }

  console.log("Seed complete:");
  console.log(
    `  Users: ${fleetManager.email}, ${driverUser.email}, ${safetyOfficer.email}, ${financialAnalyst.email} (password: password123)`
  );
  console.log(
    `  Vehicles: ${vehicleA.registrationNumber}, ${vehicleB.registrationNumber}, ${vehicleC.registrationNumber}, ${vehicleD.registrationNumber}`
  );
  console.log(
    `  Drivers: ${driverA.licenseNumber}, ${driverB.licenseNumber}, ${driverC.licenseNumber} (expired license), ${driverD.licenseNumber} (suspended)`
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
