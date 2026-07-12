const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  const token = generateToken({ id: user.id, role: user.role });

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({ id: user.id, role: user.role });

  res.json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

module.exports = { register, login, getMe };
