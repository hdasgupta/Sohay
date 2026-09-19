import { verifyToken } from '../utils/tokens.js';
import { getUserById } from '../models/generalModel.js';

export async function authenticate(req,res,next){
  try{
    const raw=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
    if(!raw) return res.status(401).json({success:false,message:'Authentication required'});
    const payload=verifyToken(raw); const user=await getUserById(payload.sub);
    if(!user || !user.is_active) return res.status(401).json({success:false,message:'Account is inactive or invalid'});
    req.user=user; next();
  }catch(e){console.error('[auth]',e);return res.status(401).json({success:false,message:'Invalid session'});}
}
export function authorize(...roles){ return (req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({success:false,message:'Not allowed'}); }
