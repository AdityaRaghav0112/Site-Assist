require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected (chatbot DB)");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error", err);
  process.exit(1);
});

module.exports = pool;
