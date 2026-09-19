import crypto from 'node:crypto';
import { hashPassword, validatePassword } from '../utils/password.js';
import * as admin from '../models/adminModel.js';
import * as general from '../models/generalModel.js';
import { appointmentEmail, sendEmail } from '../services/emailService.js';
import { fail, ok } from '../utils/response.js';
import { generateThirtyMinuteSlots, isFutureDate, minutesToTime, parseTimeToMinutes } from '../utils/time.js';

function validateAvailability(availability){
  if(!Array.isArray(availability)||!availability.length) return 'Doctor needs at least one availability slot';
  const groups=new Map();
  for(const s of availability){const start=String(s.startTime),end=String(s.endTime),parts=start.split(':'),e=end.split(':'); const mins=(Number(parts[0])*60+Number(parts[1])), em=(Number(e[0])*60+Number(e[1])); if(!Number.isInteger(Number(s.weekday))||Number(s.weekday)<0||Number(s.weekday)>6) return 'Invalid weekday'; if(em<=mins||((em-mins)%30)!==0) return 'Availability must use 30-minute intervals'; if(!groups.has(s.weekday)) groups.set(s.weekday,[]); groups.get(s.weekday).push([mins,em]); }
  for(const [,arr] of groups){arr.sort((a,b)=>a[0]-b[0]); for(let i=1;i<arr.length;i++) if(arr[i][0]<arr[i-1][1]) return 'Doctor availability slots conflict';}
}
export async function listDoctors(req,res){return ok(res,await admin.listDoctors());}
export async function listPatients(req,res){return ok(res,await admin.listPatientsForSelect());}
export async function addDoctor(req,res){
  const {name,email,password,confirmPassword,sex,speciality,availability}=req.body; const error=validateAvailability(availability); if(error) return fail(res,error);
  if(password!==confirmPassword||!validatePassword(password)) return fail(res,'Invalid doctor password');
  const hash=await hashPassword(password); await admin.createDoctor({id:crypto.randomUUID(),name,email:email.toLowerCase(),passwordHash:hash,sex,speciality,availability});
  return ok(res,{},'Doctor added successfully',201);
}
export async function editDoctor(req,res){
  const {id}=req.params; const {name,email,password,confirmPassword,sex,speciality,availability}=req.body; const error=validateAvailability(availability); if(error) return fail(res,error);
  if(password && (password!==confirmPassword || !validatePassword(password))) return fail(res,'Invalid doctor password');
  await admin.updateDoctor({id,name,email:email.toLowerCase(),passwordHash:password?await hashPassword(password):null,sex,speciality,availability}); return ok(res,{},'Doctor updated successfully');
}
export async function setDoctorActive(req,res){const result=await admin.setDoctorActive(req.params.id,Boolean(req.body.isActive)); if(!result) return fail(res,'Doctor not found',404); return ok(res,result,'Doctor status updated');}
export async function upcoming(req,res){return ok(res,await admin.listUpcomingForPatientDoctor(req.query.patientId,req.query.doctorId));}
export async function availability(req,res){
  const {doctorId,date,patientId,beneficiaryPatientId}=req.query; if(!doctorId||!date||!isFutureDate(date)) return fail(res,'Invalid date');
  const weekday=new Date(`${date}T00:00:00`).getDay(); const ranges=await admin.dayAvailability(doctorId,weekday); const booked=new Set(await admin.doctorBookedSlots(doctorId,date)); const bookingUserBooked=new Set(patientId?await admin.bookingUserBookedSlots(patientId,date):[]); const beneficiaryBooked=new Set(beneficiaryPatientId?await admin.patientBookedSlots(beneficiaryPatientId,date):[]); const slots=ranges.flatMap(r=>generateThirtyMinuteSlots(r.start_time,r.end_time)).filter(s=>!booked.has(s)&&!bookingUserBooked.has(s)&&!beneficiaryBooked.has(s)); return ok(res,{slots});
}
export async function reschedule(req,res){
  const {id,doctorId,patientId,date,slotStart}=req.body; if(!isFutureDate(date)) return fail(res,'Date must be today or later');
  const appointment=await admin.appointmentForReschedule(id,doctorId,patientId); if(!appointment) return fail(res,'Upcoming appointment not found',404);
  const ranges=await admin.dayAvailability(doctorId,new Date(`${date}T00:00:00`).getDay()); const legal=ranges.flatMap(r=>generateThirtyMinuteSlots(r.start_time,r.end_time)); if(!legal.includes(slotStart)) return fail(res,'Selected time is outside doctor availability');
  const booked=new Set(await admin.doctorBookedSlots(doctorId,date)); const bookingUserBooked=new Set(await admin.bookingUserBookedSlots(patientId,date)); const beneficiaryBooked=new Set(await admin.patientBookedSlots(appointment.beneficiary_patient_id,date)); if((date!==appointment.appointment_date || slotStart!==appointment.slot_start)&&(booked.has(slotStart)||bookingUserBooked.has(slotStart)||beneficiaryBooked.has(slotStart))) return fail(res,'Selected time is already booked');
  const end=minutesToTime(parseTimeToMinutes(slotStart)+30);
  const result=await admin.updateAppointmentReschedule(id,date,slotStart,end); const contact=await admin.appointmentContact(id); if(contact) await sendEmail({to:contact.patient_email,subject:'Appointment rescheduled',html:appointmentEmail({...contact,appointment_date:String(result.appointment_date).slice(0,10),slot_start:result.slot_start})}); return ok(res,result,'Appointment rescheduled');
}
