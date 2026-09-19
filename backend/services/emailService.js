import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({ host: env.smtp.host, port: env.smtp.port, secure: env.smtp.secure, auth: { user: env.smtp.user, pass: env.smtp.pass } });
  }
  return transporter;
}
export async function sendEmail({to,subject,html}) {
  if (!env.smtp.user || !env.smtp.pass) { console.warn('[email] SMTP not configured; skipped', to, subject); return; }
  console.log('[email] sending', to, subject);
  await getTransporter().sendMail({ from: env.smtp.from, to, subject, html });
}
export const otpEmail = (otp,minutes) => `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:28px;background:#08111f;color:#eaf2ff"><h2 style="color:#5aa0ff">West Bengal Forum for Mental Health</h2><p>Your one-time password is valid for <b>${minutes} minutes</b>.</p><div style="font-size:42px;letter-spacing:10px;text-align:center;background:#111f33;padding:20px;border-radius:12px;font-weight:700">${otp}</div><p>Do not share this OTP. It expires automatically.</p></div>`;
export const appointmentEmail = (a) => `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h2>Appointment confirmed</h2><p>Patient: <b>${a.patient_name}</b></p><p>Doctor: <b>${a.doctor_name}</b></p><p>Date: <b>${a.appointment_date}</b> Time: <b>${a.slot_start}</b></p><p><a href="${env.frontendUrl}/meeting/${a.id}">Join consultation</a></p></div>`;
export const familyInviteEmail = ({name,acceptUrl,rejectUrl}) => `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h2>Family invitation</h2><p>${name} invited you to join a family on West Bengal Forum for Mental Health.</p><p><a href="${acceptUrl}">Accept</a> &nbsp; <a href="${rejectUrl}">Reject</a></p></div>`;
