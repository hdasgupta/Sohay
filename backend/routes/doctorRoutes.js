import { Router } from 'express';
import * as c from '../controllers/doctorController.js';
const r=Router();
r.get('/appointments',c.appointments);
r.get('/today-patients',c.todayPatients);
r.get('/medicines/search',c.searchMedicines);
r.post('/prescriptions',c.createPrescription);
r.get('/appointments/:id/meeting-token',c.meetingToken);
export default r;
