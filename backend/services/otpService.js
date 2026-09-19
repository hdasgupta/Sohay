import crypto from 'node:crypto';
import * as general from '../models/generalModel.js';
import { sendEmail, otpEmail } from './emailService.js';
import { env } from '../config/env.js';

export async function issueOtp(email,purpose) {
  const otp = crypto.randomInt(100000,1000000).toString();
  const record = await general.createOtp({email,purpose,code:otp});
  await sendEmail({to:email,subject:'Your verification OTP',html:otpEmail(otp,env.otpMinutes)});
  return { expiresAt: record.expiresAt };
}
export async function verifyOtp(email,purpose,code) {
  const otp = await general.getLatestOtp(email,purpose);
  if (!otp || otp.verified || new Date(otp.expires_at) <= new Date()) return false;
  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.default.compare(code,otp.code_hash);
  if (valid) await general.markOtpVerified(otp.id);
  return valid;
}
