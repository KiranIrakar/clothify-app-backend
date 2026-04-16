import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { Client } from "pg";
import logger from "../config/logger";

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // ✅ required for Neon
  },
});

async function migrate() {
  try {
    await client.connect();
    logger.info("Connected to DB");

    // ✅ Create migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE,
        run_on TIMESTAMP DEFAULT NOW()
      );
    `);

    const migrationsPath = path.join(__dirname, "../migration");
    const files = fs.readdirSync(migrationsPath).sort();

    for (const file of files) {
      const res = await client.query(
        "SELECT * FROM migrations WHERE filename = $1",
        [file]
      );

      if (res.rows.length === 0) {
        logger.info({ file }, "Running migration");
        const sql = fs.readFileSync(
          path.join(migrationsPath, file),
          "utf-8"
        );

        await client.query(sql);

        await client.query(
          "INSERT INTO migrations (filename) VALUES ($1)",
          [file]
        );

        logger.info({ file }, "Migration completed");
      } else {
        logger.info({ file }, "Migration already run, skipping");
      }
    }

    logger.info("All migrations completed");
    await client.end();
  } catch (err) {
    logger.error({ err }, "Migration failed");
    await client.end();
  }
}

migrate();