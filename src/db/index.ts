import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

export const createPool = () => {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (connectionString) {
    return new Pool({
      connectionString,
      connectionTimeoutMillis: 15000,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? undefined : { rejectUnauthorized: false },
    });
  }
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
