require("dotenv").config();
const app = require("./src/app");
const prisma = require("./src/config/prisma");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to database");

    app.listen(PORT, () => {
      console.log(`TransitOps API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
