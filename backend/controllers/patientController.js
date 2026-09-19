import crypto from 'node:crypto';
import * as patient from '../models/patientModel.js';
import * as admin from '../models/adminModel.js';
import { fail, ok } from '../utils/response.js';
import { generateThirtyMinuteSlots, isFutureDate, minutesToTime, parseTimeToMinutes } from '../utils/time.js';
import { appointmentEmail, familyInviteEmail, sendEmail } from '../services/emailService.js';
import { createMeetingToken } from '../services/jitsiService.js';
import { env } from '../config/env.js';

export async function getFamily(req,res){return ok(res,await patient.family(req.user.id));}
export async function createFamily(req,res){
  const current=await patient.family(req.user.id); if(current.length) return fail(res,'You already belong to a family');
  const name=String(req.body.name||'').trim(); if(!name) return fail(res,'Family name is required');
  return ok(res,await patient.createFamily(req.user.id,name),'Family created',201);
}
export async function inviteFamily(req,res){
  const membership=await patient.familyMembership(req.user.id); if(!membership) return fail(res,'Create or join a family first');
  const invitee=await patient.findPatient(String(req.body.email||'').trim().toLowerCase()); if(!invitee) return fail(res,'Active patient not found'); if(invitee.id===req.user.id) return fail(res,'You cannot invite yourself');
  const row=await patient.addFamilyMember({familyId:membership.family_id,patientId:invitee.id,invitedBy:req.user.id});
  const acceptUrl=`${env.frontendUrl}/family/invite/${row.id}/accept`; const rejectUrl=`${env.frontendUrl}/family/invite/${row.id}/reject`;
  await sendEmail({to:invitee.email,subject:'Family invitation',html:familyInviteEmail({name:req.user.name,acceptUrl,rejectUrl})}); return ok(res,row,'Invitation sent',201);
}
export async function respondFamily(req,res){const status=req.params.action==='accept'?'accepted':'rejected'; const contact=await patient.familyInviteContact(req.params.membershipId); const result=await patient.respondFamilyInvite(req.params.membershipId,req.user.id,status); if(!result) return fail(res,'Invitation not found',404); if(contact?.inviter_email) await sendEmail({to:contact.inviter_email,subject:'Family invitation response',html:`<div style="font-family:Arial,sans-serif"><p>${contact.invitee_name} has <b>${status}</b> your family invitation.</p></div>`}); return ok(res,result,`Invitation ${status}`);}
export async function doctors(req,res){return ok(res,await patient.activeDoctors());}
export async function familyMembers(req,res){const membership=await patient.familyMembership(req.user.id); return ok(res,membership?await patient.bookingFamilyMembers(membership.family_id):[]);}
export async function availability(req,res){
  const {doctorId,date,beneficiaryPatientId}=req.query; if(!doctorId||!date||!isFutureDate(date)) return fail(res,'Invalid date');
  const weekday=new Date(`${date}T00:00:00`).getDay(); const ranges=await admin.dayAvailability(doctorId,weekday); const booked=new Set(await admin.doctorBookedSlots(doctorId,date)); const bookingUserBooked=new Set(await admin.bookingUserBookedSlots(req.user.id,date)); const beneficiaryBooked=new Set(beneficiaryPatientId?await admin.patientBookedSlots(beneficiaryPatientId,date):[]); const slots=ranges.flatMap(r=>generateThirtyMinuteSlots(r.start_time,r.end_time)).filter(x=>!booked.has(x)&&!bookingUserBooked.has(x)&&!beneficiaryBooked.has(x)); return ok(res,{slots});
}
export async function book(req,res){
  const {beneficiaryPatientId,doctorId,date,slotStart}=req.body; if(!isFutureDate(date)) return fail(res,'Date must be today or later');
  const beneficiary=beneficiaryPatientId||req.user.id; const membership=await patient.familyMembership(req.user.id);
  if(beneficiary!==req.user.id){ if(!membership) return fail(res,'Family membership required'); const members=await patient.bookingFamilyMembers(membership.family_id); if(!members.some(x=>x.id===beneficiary)) return fail(res,'Selected family member is not an accepted member'); }
  const weekday=new Date(`${date}T00:00:00`).getDay(); const ranges=await admin.dayAvailability(doctorId,weekday); const legal=ranges.flatMap(r=>generateThirtyMinuteSlots(r.start_time,r.end_time)); if(!legal.includes(slotStart)) return fail(res,'Selected time is outside doctor availability');
  const doctorBooked=new Set(await admin.doctorBookedSlots(doctorId,date)); const bookingUserBooked=new Set(await admin.bookingUserBookedSlots(req.user.id,date)); const beneficiaryBooked=new Set(await admin.patientBookedSlots(beneficiary,date)); if(doctorBooked.has(slotStart)||bookingUserBooked.has(slotStart)||beneficiaryBooked.has(slotStart)) return fail(res,'Selected time is already booked');
  const startMinutes=parseTimeToMinutes(slotStart); const endTime=minutesToTime(startMinutes+30); const roomId=`${env.jaas.tenant||'wbffmh'}-${crypto.randomUUID()}`;
  try{
    const row=await patient.insertAppointment([crypto.randomUUID(),req.user.id,beneficiary,doctorId,date,slotStart,endTime,'scheduled',roomId]);
    await sendEmail({to:row.patient_email,subject:'Appointment confirmed',html:appointmentEmail(row)});
    return ok(res,row,'Appointment booked',201);
  }catch(error){console.error('[patient] booking failed',error); if(error.code==='23505') return fail(res,'That appointment slot is no longer available',409); throw error;}
}
export async function appointments(req,res){return ok(res,await patient.listAppointmentsPatient(req.user.id));}
export async function cancel(req,res){const result=await patient.cancelAppointment(req.params.id,req.user.id); if(!result) return fail(res,'Upcoming appointment not found',404); return ok(res,result,'Appointment cancelled');}
export async function meetingToken(req,res){
  const a=await patient.getAppointmentForPatient(req.params.id,req.user.id); if(!a) return fail(res,'Appointment not found',404); if(['scheduled','rescheduled'].includes(a.status)===false) return fail(res,'Meeting is not active');
  const token=await createMeetingToken({room:a.room_id,userName:req.user.name,userEmail:req.user.email,moderator:false}); return ok(res,{token,domain:env.jaas.domain,room:a.room_id,appointment:a});
}
export async function prescriptionDownload(req,res){
  const a=await patient.getAppointmentForPatient(req.params.id,req.user.id); if(!a) return fail(res,'Appointment not found',404); const prescription=await patient.getPrescriptionByAppointment(a.id); if(!prescription?.pdf_url) return fail(res,'Prescription not available',404); const key=prescription.pdf_url.includes('/prescriptions/')?prescription.pdf_url.split('/prescriptions/')[1]:null; const { signedPrescriptionUrl }=await import('../services/pdfService.js'); if(key){return ok(res,{url:await signedPrescriptionUrl(key)});} return ok(res,{url:prescription.pdf_url});
}
