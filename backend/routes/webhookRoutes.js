import { Router } from 'express';
import * as c from '../controllers/doctorController.js';
import { env } from '../config/env.js';
const r=Router();
r.post('/jaas/recording',(req,res,next)=>{if(env.jaas.webhookSecret && req.headers['x-jaas-webhook-secret']!==env.jaas.webhookSecret)return res.status(401).json({success:false,message:'Invalid webhook secret'});next()},c.recordingWebhook);
export default r;
