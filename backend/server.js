import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export const app=express();
app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:env.frontendUrl,credentials:false,methods:['GET','POST','PUT','PATCH','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(express.json({limit:'2mb'}));
app.use(rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:'draft-8',legacyHeaders:false}));
app.get('/health',(req,res)=>res.json({success:true,status:'ok',time:new Date().toISOString()}));
app.use('/api',routes);
app.use((req,res)=>res.status(404).json({success:false,message:'Route not found'}));
app.use(errorHandler);
