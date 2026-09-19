import cron from 'node-cron';
import { query } from '../config/db.js';
import { cancelExpiredAppointmentsSql } from './sql/maintenance.js';
export async function cancelExpired(){const result=await query(cancelExpiredAppointmentsSql,['cancelled',['scheduled','rescheduled'],'Asia/Kolkata']); console.log('[maintenance] cancelled',result.rowCount,'expired appointments'); return result.rowCount;}
export function startNightlyJob(){cron.schedule('30 18 * * *',()=>cancelExpired().catch(e=>console.error('[maintenance] failed',e)),{timezone:'UTC'});console.log('[maintenance] scheduled for 00:00 IST / 18:30 UTC');}
if(process.argv[1]?.endsWith('nightly-maintenance.js')){await cancelExpired();process.exit(0);}
