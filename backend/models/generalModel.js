import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';
import * as q from '../scripts/sql/general.js';

export const insertPatientProfile = async (userId,sex,contactNumber) => query(q.insertPatientProfileSql,[userId,sex,contactNumber]);
export const insertUserWithClient = async (client, params) => (await client.query(q.insertUserSql, params)).rows[0];
export const insertPatientUserWithClient = async (client, params) => (await client.query(q.insertPatientUserSql, params)).rows[0];
export const getUserByEmail = async (email) => (await query(q.getUserByEmailSql, [email])).rows[0] || null;
export const getUserById = async (id) => (await query(q.getUserByIdSql, [id])).rows[0] || null;
export const getPatientByEmail = async (email) => (await query(q.getPatientByEmailSql, [email, 'patient'])).rows[0] || null;
export const getAdminByEmail = async (email) => (await query(q.getAdminByEmailSql, [email, 'admin'])).rows[0] || null;
export const insertUser = async ({ id, name, email, passwordHash, role, isActive = true }) => (await query(q.insertUserSql, [id,name,email,passwordHash,role,isActive])).rows[0];
export const updatePassword = async (id, passwordHash) => (await query(q.updatePasswordSql, [id,passwordHash])).rows[0];

export const createOtp = async ({ email, purpose, code }) => {
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + Number(process.env.OTP_MINUTES || 10) * 60_000);
  await query(q.insertOtpSql, [id,email,purpose,hash,expiresAt,false]);
  return { id, expiresAt };
};
export const getLatestOtp = async (email, purpose) => (await query(q.getLatestOtpSql, [email,purpose])).rows[0] || null;
export const markOtpVerified = async (id) => (await query(q.markOtpVerifiedSql, [id,true])).rows[0];
export const hasUsersTable = async () => Boolean((await query(q.hasUsersTableSql, ['public','users'])).rows[0]?.exists);
export const medicineCount = async () => Number((await query(q.listMedicineCountSql)).rows[0]?.count || 0);
export const insertMedicine = async (name) => query(q.insertMedicineSql, [crypto.randomUUID(), name]);
export const withTx = async (callback) => {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const r = await callback(client); await client.query('COMMIT'); return r; }
  catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
};

