# TransitOps Backend

Node.js + Express + PostgreSQL (Neon) + Prisma backend for the TransitOps fleet operations platform — digitizes vehicle, driver, dispatch, maintenance, and expense management while enforcing business rules and providing operational insights.

## Setup

1. `cd Backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your real Neon `DATABASE_URL` and a `JWT_SECRET`.
4. `npm run prisma:migrate` — creates tables in your Neon database from `prisma/schema.prisma`.
5. `npm run seed` — populates demo users, vehicles, drivers, and trip/maintenance/fuel/expense history (safe to re-run; upserts rather than wiping the DB).
6. `npm run dev` — starts the API on `http://localhost:4000` with auto-reload.

Health check: `GET /api/health`

### Demo accounts (after `npm run seed`)

All demo accounts use password `password123`.

| Role | Email |
|---|---|
| Fleet Manager | `fleetmanager@transitops.com` |
| Driver | `driver@transitops.com` |
| Safety Officer | `safetyofficer@transitops.com` |
| Financial Analyst | `analyst@transitops.com` |

Seed data also includes: a vehicle currently `ON_TRIP`, one `IN_SHOP` (active maintenance), one `RETIRED`; a driver with an expired license and one `SUSPENDED` driver (to demo the dispatch validation rules); and a completed/draft/dispatched/cancelled trip each.

## Project structure

```
Backend/
  prisma/
    schema.prisma       # data model
    seed.js              # demo data (idempotent, upsert-based)
  src/
    config/prisma.js    # Prisma client singleton
    controllers/         # request handlers (business logic)
    routes/               # Express routers
    middleware/           # auth, RBAC, validation, error handling
    validators/           # Zod request schemas
    utils/                 # helpers (asyncHandler, AppError, generateToken)
    app.js                 # Express app setup
  server.js                 # entry point
```

## Scripts

- `npm run dev` — start with nodemon
- `npm start` — start (production)
- `npm run prisma:generate` — regenerate Prisma client after schema changes
- `npm run prisma:migrate` — create/apply a migration
- `npm run prisma:studio` — open Prisma Studio (DB GUI)
- `npm run seed` — populate demo data

## Roles & permissions (RBAC)

| Role | Can write | Read access |
|---|---|---|
| `FLEET_MANAGER` | Vehicles, Drivers, Trips, Maintenance | Everything |
| `DRIVER` | Trips, Fuel logs | Everything |
| `SAFETY_OFFICER` | Drivers | Everything |
| `FINANCIAL_ANALYST` | Expenses | Everything |

All endpoints except `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

## API reference

All responses follow `{ success: boolean, data?: ..., message?: string }`. List endpoints support `page`, `limit`, `sortBy`, `sortOrder` query params and return `{ data: { <items>, pagination } }`.

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | `{ name, email, password, role }` → creates a user, returns a token |
| POST | `/login` | — | `{ email, password }` → returns a token |
| GET | `/me` | any | Current user's profile |

### Vehicles — `/api/vehicles`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | any | Filters: `status`, `type`, `region`, `search`, `dispatchable` (status=AVAILABLE) |
| POST | `/` | FLEET_MANAGER | `{ registrationNumber, name, type, maxLoadCapacity, odometer?, acquisitionCost, status?, region? }` |
| GET | `/:id` | any | |
| PATCH | `/:id` | FLEET_MANAGER | Partial update. Status can only be set to `AVAILABLE`/`IN_SHOP`/`RETIRED` manually — `ON_TRIP` is trip-controlled. Blocked while vehicle is `ON_TRIP`. |
| DELETE | `/:id` | FLEET_MANAGER | Blocked while vehicle is `ON_TRIP` or referenced by other records |

### Drivers — `/api/drivers`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | any | Filters: `status`, `licenseCategory`, `search`, `dispatchable` (AVAILABLE + license not expired) |
| POST | `/` | FLEET_MANAGER, SAFETY_OFFICER | `{ name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore?, status? }` |
| GET | `/:id` | any | |
| PATCH | `/:id` | FLEET_MANAGER, SAFETY_OFFICER | Same manual-status restriction as vehicles (`ON_TRIP` excluded) |
| DELETE | `/:id` | FLEET_MANAGER, SAFETY_OFFICER | Blocked while driver is `ON_TRIP` |

### Trips — `/api/trips`
Lifecycle: **Draft → Dispatched → Completed / Cancelled**

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | any | Filters: `status`, `vehicleId`, `driverId`, `search` |
| POST | `/` | DRIVER, FLEET_MANAGER | `{ source, destination, vehicleId, driverId, cargoWeight, plannedDistance }`. Validates vehicle/driver are `AVAILABLE`, license not expired, cargo ≤ max load capacity. |
| GET | `/:id` | any | |
| PATCH | `/:id/dispatch` | DRIVER, FLEET_MANAGER | Re-validates availability, then sets trip `DISPATCHED` and vehicle+driver `ON_TRIP` |
| PATCH | `/:id/complete` | DRIVER, FLEET_MANAGER | `{ finalOdometer, fuelConsumed }` → trip `COMPLETED`, vehicle+driver back to `AVAILABLE`, vehicle odometer updated, `actualDistance` derived |
| PATCH | `/:id/cancel` | DRIVER, FLEET_MANAGER | From `DRAFT` or `DISPATCHED`; restores vehicle+driver to `AVAILABLE` only if it had been dispatched |
| DELETE | `/:id` | DRIVER, FLEET_MANAGER | Only allowed while `DRAFT` |

### Maintenance — `/api/maintenance`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | any | Filters: `status`, `vehicleId` |
| POST | `/` | FLEET_MANAGER | `{ vehicleId, description, cost? }`. Rejects if vehicle is `ON_TRIP`, `RETIRED`, or already `IN_SHOP`. Sets vehicle `IN_SHOP`. |
| GET | `/:id` | any | |
| PATCH | `/:id/close` | FLEET_MANAGER | Closes the record; restores vehicle to `AVAILABLE` unless it's since been `RETIRED` |

### Fuel logs — `/api/fuel-logs`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | any | Filters: `vehicleId`, `tripId` |
| POST | `/` | FLEET_MANAGER, DRIVER | `{ vehicleId, tripId?, liters, cost, date? }`. If `tripId` given, it must belong to `vehicleId`. |
| GET | `/:id` | any | |
| DELETE | `/:id` | FLEET_MANAGER | |

### Expenses — `/api/expenses`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | any | Filters: `vehicleId`, `tripId`, `type` |
| POST | `/` | FLEET_MANAGER, FINANCIAL_ANALYST | `{ vehicleId, tripId?, type, amount, description?, date? }`. If `tripId` given, it must belong to `vehicleId`. |
| GET | `/:id` | any | |
| DELETE | `/:id` | FLEET_MANAGER, FINANCIAL_ANALYST | |

### Reports — `/api/reports`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/kpis` | any | Dashboard KPIs: active/available/in-maintenance vehicle counts, active/pending trips, drivers on duty, fleet utilization % |
| GET | `/vehicles/:id/stats` | any | Per-vehicle: fuel efficiency, total maintenance/fuel/expense cost, operational cost (Fuel + Maintenance), estimated revenue, ROI |
| GET | `/export` | FLEET_MANAGER, FINANCIAL_ANALYST | CSV export of all vehicles' stats |

**Note on ROI**: revenue isn't tracked anywhere in the data model (no per-trip pricing field), so `/reports/vehicles/:id/stats` estimates it as `completed trip distance × $2.50/km` — a placeholder assumption, not a real figure. Treat ROI/revenue as illustrative until a real revenue source is wired in.

## Mandatory business rules enforced

- Vehicle registration number is unique.
- `RETIRED` or `IN_SHOP` vehicles are excluded from dispatch (`dispatchable=true` filter, and trip creation/dispatch validation).
- Drivers with an expired license or `SUSPENDED` status cannot be assigned to trips.
- A vehicle or driver already `ON_TRIP` cannot be assigned to another trip.
- Cargo weight cannot exceed the vehicle's max load capacity.
- Dispatch → vehicle + driver become `ON_TRIP`. Complete → both become `AVAILABLE` again. Cancel → restores `AVAILABLE` only if the trip had actually been dispatched.
- Creating an active maintenance record sets the vehicle `IN_SHOP`; closing it restores `AVAILABLE` unless the vehicle has since been `RETIRED`.
