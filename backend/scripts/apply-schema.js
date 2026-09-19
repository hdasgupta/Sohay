import fs from 'node:fs/promises';
import { pool } from '../config/db.js';

const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
try {
  await pool.query(schema);
  console.log('[schema] applied');
} catch (error) {
  console.error('[schema] failed', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
