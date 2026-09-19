import crypto from 'node:crypto';
import { env } from '../config/env.js';
import * as general from '../models/generalModel.js';
import { hashPassword } from '../utils/password.js';

const DEFAULT_ADMIN_HASH = '$2b$12$dRRaeogoFhw1D.No/N47IeIbA5Kgh4/PEdF3OKA8BTZNSdGaAtz7a';
export async function seedAdmin(){
  const email=env.adminEmail || 'wbffmh@gmail.com';
  const exists=await general.getAdminByEmail(email); if(exists) return;
  const passwordHash=env.adminPassword ? await hashPassword(env.adminPassword) : DEFAULT_ADMIN_HASH;
  await general.insertUser({id:crypto.randomUUID(),name:'Administrator',email,passwordHash,role:'admin',isActive:true});
  console.log('[seed] admin created',email);
}

if(process.argv[1]?.endsWith('seed-admin.js')){await seedAdmin();}
