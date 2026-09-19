import crypto from 'node:crypto';
import * as patient from '../models/patientModel.js';
import { fail, ok } from '../utils/response.js';
import { calculateAge, currentDateInIndia } from '../utils/time.js';
import { buildPrescriptionPdf, storePrescriptionPdf } from '../services/pdfService.js';

export async function appointments(req,res){return ok(res,await patient.listAppointmentsDoctor(req.user.id));}
export async function todayPatients(req,res){return ok(res,await patient.todayPatientsForDoctor(req.user.id));}
export async function searchMedicines(req,res){const term=String(req.query.q||'').trim(); if(term.length<2) return ok(res,[]); return ok(res,await patient.searchMedicines(term,20));}
function normalizeItems(items){
  if(!Array.isArray(items)||!items.length) throw Object.assign(new Error('At least one medicine is required'),{status:400});
  return items.map(item=>{if(!item.medicineName||!item.dose||!item.foodTiming) throw Object.assign(new Error('Medicine name, dose and food timing are required'),{status:400}); if(!['before','with','after'].includes(item.foodTiming)) throw Object.assign(new Error('Invalid food timing'),{status:400}); return {medicine_name:String(item.medicineName),dose:String(item.dose),condition_note:String(item.conditionNote||''),morning:!!item.morning,afternoon:!!item.afternoon,evening:!!item.evening,night:!!item.night,sos:!!item.sos,food_timing:item.foodTiming};});
}
export async function createPrescription(req,res){
  const {appointmentId,age,items}=req.body; const appointment=await patient.getAppointmentForDoctor(appointmentId,req.user.id); if(!appointment) return fail(res,'Today appointment not found',404);
  if(!['scheduled','rescheduled'].includes(appointment.status) || String(appointment.appointment_date).slice(0,10)!==currentDateInIndia()) return fail(res,'Prescription can only be generated for today');
  const existing=await patient.getPrescriptionByAppointment(appointmentId); if(existing) return fail(res,'Prescription has already been generated for this appointment',409);
  const normalized=normalizeItems(items); const finalAge=Number.isInteger(Number(age))?Number(age):calculateAge(appointment.patient_dob);
  const doctor=(await import('../models/adminModel.js')).getDoctorById; const doctorProfile=await doctor(req.user.id); const data={doctorName:appointment.doctor_name,speciality:doctorProfile.speciality,patientName:appointment.patient_name,age:finalAge,date:currentDateInIndia(),items:normalized};
  const bytes=await buildPrescriptionPdf(data); const key=`prescriptions/${appointmentId}/${crypto.randomUUID()}.pdf`; const url=await storePrescriptionPdf({key,bytes});
  const p=await patient.insertPrescription([crypto.randomUUID(),appointmentId,req.user.id,appointment.patient_id,appointment.beneficiary_patient_id,currentDateInIndia(),finalAge,url]);
  for(const item of normalized) await patient.insertPrescriptionItem([crypto.randomUUID(),p.id,item.medicine_name,item.dose,item.condition_note,item.morning,item.afternoon,item.evening,item.night,item.sos,item.food_timing]);
  await patient.markAppointmentCompleted(appointmentId,req.user.id);
  return ok(res,{prescriptionId:p.id,url},'Prescription generated',201);
}
export async function meetingToken(req,res){
  const a=await patient.getAppointmentForDoctor(req.params.id,req.user.id); if(!a) return fail(res,'Appointment not found',404); const token=await (await import('../services/jitsiService.js')).createMeetingToken({room:a.room_id,userName:req.user.name,userEmail:req.user.email,moderator:true}); return ok(res,{token,domain:(await import('../config/env.js')).env.jaas.domain,room:a.room_id,appointment:a});
}
export async function recordingWebhook(req,res){
  console.log('[jaas] recording webhook received',req.body?.event || req.body?.type || 'unknown');
  const recording=req.body?.recording || req.body?.data?.recording || null; if(!recording?.url) return ok(res,{},'Webhook accepted');
  try{ const url=new URL(recording.url); if(url.protocol!=='https:' || !env.jaas.recordingAllowedHosts.some(host=>url.hostname===host || url.hostname.endsWith(`.${host}`))) return fail(res,'Recording source is not allowed',400); const axios=(await import('axios')).default; const response=await axios.get(url.toString(),{responseType:'arraybuffer',timeout:120000,maxContentLength:300*1024*1024,maxBodyLength:300*1024*1024}); const {uploadRecordingToDrive}=await import('../services/driveService.js'); await uploadRecordingToDrive({name:`appointment-${req.body?.room||'recording'}.mp4`,buffer:Buffer.from(response.data)}); return ok(res,{},'Recording uploaded'); }catch(e){console.error('[jaas] upload failed',e); return fail(res,'Recording received but upload failed',500);}
}
