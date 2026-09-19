import crypto from 'node:crypto';
import { comparePassword, hashPassword, validatePassword } from '../utils/password.js';
import { createCaptcha, validateCaptcha } from '../utils/captcha.js';
import * as general from '../models/generalModel.js';
import { issueOtp, verifyOtp } from '../services/otpService.js';
import { signToken } from '../utils/tokens.js';
import { fail, ok } from '../utils/response.js';

export function captcha(req,res){ return ok(res,createCaptcha()); }
export async function login(req,res){
  const {email,password,captchaId,captchaAnswer}=req.body;
  if(!validateCaptcha(captchaId,captchaAnswer)) return fail(res,'Invalid captcha');
  const user=await general.getUserByEmail(String(email).trim());
  if(!user || !user.is_active || !(await comparePassword(password,user.password_hash))) return fail(res,'Invalid email or password',401);
  console.log('[auth] login',user.email,user.role);
  return ok(res,{token:signToken(user),user:{id:user.id,name:user.name,email:user.email,role:user.role}},'Login successful');
}
export async function sendRegistrationOtp(req,res){
  const email=String(req.body.email||'').trim().toLowerCase();
  if(await general.getUserByEmail(email)) return fail(res,'Email already exists',409);
  const data=await issueOtp(email,'registration'); return ok(res,data,'OTP sent successfully');
}
export async function registerPatient(req,res){
  const {name,sex,dateOfBirth,email,contactNumber,password,confirmPassword,captchaId,captchaAnswer,otp}=req.body;
  if(!validateCaptcha(captchaId,captchaAnswer)) return fail(res,'Invalid captcha');
  if(password!==confirmPassword) return fail(res,'Passwords do not match');
  if(!validatePassword(password)) return fail(res,'Password does not satisfy all rules');
  if(await general.getUserByEmail(email)) return fail(res,'Email already exists',409);
  if(!(await verifyOtp(String(email).toLowerCase(),'registration',otp))) return fail(res,'Invalid or expired OTP');
  const id=crypto.randomUUID(); const hash=await hashPassword(password);
  const user=await general.withTx(async client=>{
    const result=await general.insertPatientUserWithClient(client,[id,name,String(email).toLowerCase(),hash,'patient',true,dateOfBirth]);
    await client.query((await import('../scripts/sql/general.js')).insertPatientProfileSql,[id,sex,contactNumber]);
    return result;
  });
  return ok(res,{user},'Patient registration successful',201);
}
export async function sendResetOtp(req,res){
  const email=String(req.body.email||'').trim().toLowerCase();
  if(!(await general.getUserByEmail(email))) return fail(res,'Email does not exist',404);
  const data=await issueOtp(email,'password_reset'); return ok(res,data,'OTP sent successfully');
}
export async function resetPassword(req,res){
  const {email,otp,password,confirmPassword,captchaId,captchaAnswer}=req.body;
  if(!validateCaptcha(captchaId,captchaAnswer)) return fail(res,'Invalid captcha');
  if(password!==confirmPassword) return fail(res,'Passwords do not match');
  if(!validatePassword(password)) return fail(res,'Password does not satisfy all rules');
  const user=await general.getUserByEmail(email); if(!user) return fail(res,'Email does not exist',404);
  if(!(await verifyOtp(String(email).toLowerCase(),'password_reset',otp))) return fail(res,'Invalid or expired OTP');
  await general.updatePassword(user.id,await hashPassword(password)); return ok(res,{},'Password reset successful');
}
