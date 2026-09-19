import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (error) => console.error('[db] idle client error', error));

export async function query(text, params = []) {
  console.log('[db] query', text.slice(0, 90), 'params=', params.length);
  return pool.query(text, params);
}

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
