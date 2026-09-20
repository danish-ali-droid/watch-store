import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("DB CONFIG", {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
});

const dbHost = process.env.DB_HOST || "127.0.0.1";
const useSsl =
  process.env.DB_SSL === "true" || dbHost.endsWith(".rds.amazonaws.com");

export const pool = new Pool({
  host: dbHost,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "watch_store",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query(sql, params = []) {
  try {
    let parameterIndex = 0;
    const parameterizedSql = sql.replace(/\?/g, () => `$${++parameterIndex}`);
    const res = await pool.query(parameterizedSql, params);
    return Object.assign(res.rows, {
      affectedRows: res.rowCount,
      insertId: res.rows[0]?.id,
    });
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
}
