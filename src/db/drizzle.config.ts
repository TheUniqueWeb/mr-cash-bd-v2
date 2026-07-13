import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

if (!connectionString && (!sqlHost || !sqlDbName || !user || !password)) {
  throw new Error("Missing SQL configuration environment variables (DATABASE_URL, SUPABASE_DATABASE_URL, or SQL_HOST properties).");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: connectionString ? {
    url: connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? undefined : { rejectUnauthorized: false },
  } : {
    host: sqlHost!,
    user: user!,
    password: password!,
    database: sqlDbName!,
    ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  verbose: true,
});
