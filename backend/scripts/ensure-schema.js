import fs from 'node:fs/promises';
import { pool } from '../config/db.js';
export async function ensureSchema(){const sql=await fs.readFile(new URL('./schema.sql',import.meta.url),'utf8');await pool.query(sql);console.log('[schema] verified/applied');}
