const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const prisma = require("../config/prisma");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw new AppError("Not authorized, user no longer exists", 401);
  }

  req.user = user;
  next();
});

const restrictTo =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Forbidden: requires one of these roles: ${allowedRoles.join(", ")}`,
        403
      );
    }
    next();
  };

module.exports = { protect, restrictTo };
