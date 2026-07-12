const express = require("express");
const {
  createExpense,
  getExpenses,
  getExpenseById,
  deleteExpense,
} = require("../controllers/expenseController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createExpenseSchema,
  expenseQuerySchema,
} = require("../validators/expenseValidators");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(validate(expenseQuerySchema, "query"), getExpenses)
  .post(
    restrictTo("FLEET_MANAGER", "FINANCIAL_ANALYST"),
    validate(createExpenseSchema),
    createExpense
  );

router
  .route("/:id")
  .get(getExpenseById)
  .delete(restrictTo("FLEET_MANAGER", "FINANCIAL_ANALYST"), deleteExpense);

module.exports = router;
