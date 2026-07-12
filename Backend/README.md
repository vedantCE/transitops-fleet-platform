# TransitOps Backend

Node.js + Express + PostgreSQL (Neon) + Prisma backend for the TransitOps fleet operations platform.

## Setup

1. `cd Backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your real Neon `DATABASE_URL` and a `JWT_SECRET`.
4. `npm run prisma:migrate` — creates tables in your Neon database from `prisma/schema.prisma`.
5. `npm run dev` — starts the API on `http://localhost:5000` with auto-reload.

Health check: `GET /api/health`

## Project structure

```
Backend/
  prisma/
    schema.prisma       # data model
  src/
    config/prisma.js    # Prisma client singleton
    controllers/        # request handlers (business logic)
    routes/              # Express routers
    middleware/          # auth, RBAC, error handling
    utils/               # helpers (asyncHandler, AppError)
    app.js               # Express app setup
  server.js               # entry point
```

## Scripts

- `npm run dev` — start with nodemon
- `npm start` — start (production)
- `npm run prisma:generate` — regenerate Prisma client after schema changes
- `npm run prisma:migrate` — create/apply a migration
- `npm run prisma:studio` — open Prisma Studio (DB GUI)
