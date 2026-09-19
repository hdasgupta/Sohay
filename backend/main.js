import { app } from './server.js';
import { env } from './config/env.js';
import { seedAdmin } from './scripts/seed-admin.js';
import { ensureSchema } from './scripts/ensure-schema.js';
import { seedMedicinesIfEmpty } from './services/medicineService.js';
import { startNightlyJob } from './scripts/nightly-maintenance.js';

await ensureSchema();
await seedAdmin();
try { await seedMedicinesIfEmpty(); } catch (e) { console.error('[medicine] initial import failed',e); }
if (env.enableInternalCron) startNightlyJob();
app.listen(env.port,'0.0.0.0',()=>console.log(`[server] listening on 0.0.0.0:${env.port}`));
