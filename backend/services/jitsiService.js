import crypto from 'node:crypto';
import { env } from '../config/env.js';

function privateKey() {
  return Buffer.from(env.jaas.privateKeyBase64 || '', 'base64').toString('utf8').replace(/\\n/g,'\n');
}
export async function createMeetingToken({room,userName,userEmail,moderator}) {
  if (!env.jaas.appId || !env.jaas.keyId || !env.jaas.privateKeyBase64) throw new Error('JaaS credentials are not configured');
  const jwt = await import('jsonwebtoken');
  return jwt.default.sign({ iss:'chat', aud:'jitsi', sub:env.jaas.appId, room, context:{user:{id:userEmail,name:userName,moderator:!!moderator},features:{recording:true,livestreaming:false,transcription:false}} }, privateKey(), { algorithm:'RS256', expiresIn:'2h', header:{ kid:env.jaas.keyId } });
}
export function roomForAppointment(appointmentId) { return `${env.jaas.tenant || 'wbffmh'}-${appointmentId}-${crypto.randomBytes(6).toString('hex')}`; }
