import crypto from 'node:crypto';
import { query } from '../config/db.js';
import * as q from '../scripts/sql/patient.js';

export const family = async (patientId) => (await query(q.getFamilySql,[patientId])).rows;
export const findPatient = async (email) => (await query(q.findPatientByEmailSql,[email,'patient',true])).rows[0] || null;
export const createFamily = async (patientId,name) => {
  const familyId=crypto.randomUUID();
  const result=await query(q.createFamilySql,[familyId,name,patientId]);
  await query(q.addFamilyMemberSql,[crypto.randomUUID(),familyId,patientId,'accepted',patientId]);
  return result.rows[0];
};
export const addFamilyMember = async ({familyId,patientId,invitedBy}) => (await query(q.addFamilyMemberSql,[crypto.randomUUID(),familyId,patientId,'pending',invitedBy])).rows[0];
export const familyMembership = async (patientId) => (await query(q.getFamilyMembershipForPatientSql,[patientId])).rows[0] || null;
export const respondFamilyInvite = async (membershipId,patientId,status) => (await query(q.updateFamilyInviteSql,[membershipId,status,patientId])).rows[0] || null;
export const bookingFamilyMembers = async (familyId) => (await query(q.listFamilyMembersForBookingSql,[familyId,'accepted'])).rows;
export const activeDoctors = async () => (await query(q.listActiveDoctorsSql,['doctor',true])).rows;
export const insertAppointment = async (params) => (await query(q.insertAppointmentSql,params)).rows[0];
export const listAppointmentsPatient = async (id) => (await query(q.listAppointmentsPatientSql,[id])).rows;
export const listAppointmentsDoctor = async (id) => (await query(q.listAppointmentsDoctorSql,[id])).rows;
export const cancelAppointment = async (id,patientId) => (await query(q.cancelAppointmentSql,[id,'cancelled',patientId,['scheduled','rescheduled'],'Asia/Kolkata'])).rows[0] || null;
export const getAppointmentForPatient = async (id,patientId) => (await query(q.getAppointmentForPatientSql,[id,patientId])).rows[0] || null;
export const insertPrescription = async (params) => (await query(q.insertPrescriptionSql,params)).rows[0];
export const insertPrescriptionItem = async (params) => query(q.insertPrescriptionItemSql,params);
export const markAppointmentCompleted = async (id,doctorId) => (await query(q.markAppointmentCompletedSql,[id,'completed',doctorId])).rows[0] || null;
export const getPrescriptionByAppointment = async (id) => (await query(q.getPrescriptionByAppointmentSql,[id])).rows[0] || null;
export const searchMedicines = async (term,limit=20) => (await query(q.searchMedicinesSql,[`%${term}%`,limit])).rows;
export const todayPatientsForDoctor = async (doctorId) => (await query(q.getTodayPatientsForDoctorSql,[doctorId,['scheduled','rescheduled'],'Asia/Kolkata'])).rows;
export const prescriptionItems = async (id) => (await query(q.getPrescriptionItemsSql,[id])).rows;
export const prescriptionData = async (id,doctorId) => (await query(q.getPrescriptionDataSql,[id,doctorId])).rows[0] || null;

export const familyInviteContact = async (id) => (await query(q.familyInviteContactSql,[id])).rows[0] || null;

export const getAppointmentForDoctor = async (id,doctorId) => (await query(q.getAppointmentForDoctorSql,[id,doctorId])).rows[0] || null;
