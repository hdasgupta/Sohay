import crypto from 'node:crypto';
import { query } from '../config/db.js';
import * as q from '../scripts/sql/admin.js';
import * as generalQ from '../scripts/sql/general.js';

export const listDoctors = async () => (await query(q.listDoctorsSql, ['doctor'])).rows;
export const listPatientsForSelect = async () => (await query(q.listPatientsSelectSql, ['patient', true])).rows;
export const getDoctorById = async (id) => (await query(q.getDoctorByIdSql, [id,'doctor'])).rows[0] || null;
export const createDoctor = async ({ id,name,email,passwordHash,sex,speciality,availability }) => {
  return queryTransaction(async (client) => {
    await client.query(generalQ.insertDoctorUserSql, [id,name,email,passwordHash,'doctor',true]);
    await client.query(q.insertDoctorProfileSql, [id,sex,speciality]);
    for (const slot of availability) await client.query(q.insertDoctorAvailabilitySql, [crypto.randomUUID(),id,slot.weekday,slot.startTime,slot.endTime]);
  });
};
export const updateDoctor = async ({ id,name,email,passwordHash,sex,speciality,availability }) => queryTransaction(async (client) => {
  await client.query(q.updateDoctorUserSql, [id,name,email,passwordHash || null]);
  await client.query(q.updateDoctorProfileSql, [id,sex,speciality]);
  await client.query(q.clearDoctorAvailabilitySql, [id]);
  for (const slot of availability) await client.query(q.insertDoctorAvailabilitySql, [crypto.randomUUID(),id,slot.weekday,slot.startTime,slot.endTime]);
});
export const setDoctorActive = async (id,isActive) => (await query(q.setDoctorActiveSql, [id,isActive,'doctor'])).rows[0] || null;
export const appointmentForReschedule = async (id,doctorId,patientId) => (await query(q.getAppointmentForRescheduleSql, [id,doctorId,patientId,['scheduled','rescheduled'],'Asia/Kolkata'])).rows[0] || null;
export const dayAvailability = async (doctorId,weekday) => (await query(q.getDoctorDayAvailabilitySql,[doctorId,weekday])).rows;
export const doctorBookedSlots = async (doctorId,date) => (await query(q.getDoctorBookedSlotsSql,[doctorId,date,['scheduled','rescheduled']])).rows.map(x=>x.slot_start);
export const patientBookedSlots = async (patientId,date) => (await query(q.getPatientBookedSlotsSql,[patientId,date,['scheduled','rescheduled']])).rows.map(x=>x.slot_start);
export const bookingUserBookedSlots = async (patientId,date) => (await query(q.bookingUserBookedSlotsSql,[patientId,date,['scheduled','rescheduled']])).rows.map(x=>x.slot_start);
export const updateAppointmentReschedule = async (id,date,start,end) => (await query(q.updateAppointmentRescheduleSql,[id,date,start,end,'rescheduled'])).rows[0];
export const appointmentContact = async (id) => (await query(q.getAppointmentContactSql,[id])).rows[0] || null;

async function queryTransaction(fn) {
  const { pool } = await import('../config/db.js');
  const client = await pool.connect();
  try { await client.query('BEGIN'); const r = await fn(client); await client.query('COMMIT'); return r; }
  catch(e){ await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}

export const listUpcomingForPatientDoctor = async (patientId,doctorId) => (await query(q.listUpcomingForPatientDoctorSql,[patientId,doctorId,['scheduled','rescheduled'],'Asia/Kolkata'])).rows;
