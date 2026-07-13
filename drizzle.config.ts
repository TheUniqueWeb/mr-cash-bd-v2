import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

let dbCredentials: any = {};
if (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL) {
  dbCredentials = { url: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL };
} else {
  dbCredentials = {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    ssl: process.env.SQL_SSL === 'true'
  };
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials
});
