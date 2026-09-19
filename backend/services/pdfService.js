import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { env } from '../config/env.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = env.s3.endpoint ? new S3Client({region:env.s3.region,endpoint:env.s3.endpoint,forcePathStyle:true,credentials:{accessKeyId:env.s3.accessKeyId,secretAccessKey:env.s3.secretAccessKey}}) : null;
export async function buildPrescriptionPdf({doctorName,speciality,patientName,age,date,items}) {
  const doc=await PDFDocument.create(); const page=doc.addPage([595,842]);
  const regular=await doc.embedFont(StandardFonts.Helvetica); const bold=await doc.embedFont(StandardFonts.HelveticaBold); const italic=await doc.embedFont(StandardFonts.HelveticaOblique);
  const org='West Bengal Forum for Mental Health';
  page.drawCircle({x:46,y:800,r:25,color:rgb(.08,.35,.75)}); page.drawText('WB',{x:30,y:791,size:13,font:bold,color:rgb(1,1,1)});
  page.drawText(org,{x:78,y:799,size:17,font:bold,color:rgb(.05,.17,.35)});
  page.drawText(`Doctor: ${doctorName}`,{x:42,y:758,size:12,font:bold}); page.drawText(`Speciality: ${speciality}`,{x:42,y:741,size:11,font:regular});
  page.drawLine({start:{x:42,y:724},end:{x:553,y:724},thickness:1,color:rgb(.2,.3,.4)});
  page.drawText(`Patient: ${patientName}`,{x:42,y:696,size:11,font:bold}); page.drawText(`Age: ${age}`,{x:300,y:696,size:11,font:regular}); page.drawText(`Date: ${date}`,{x:425,y:696,size:11,font:regular});
  let y=660; items.forEach((item,index)=>{ page.drawText(`${index+1}. ${item.medicine_name}`,{x:42,y,size:11,font:bold}); y-=17; page.drawText(`Dose: ${item.dose}`,{x:62,y,size:10,font:regular}); y-=15; page.drawText(`Timing: ${[item.morning&&'Morning',item.afternoon&&'Afternoon',item.evening&&'Evening',item.night&&'Night'].filter(Boolean).join(', ')||'As directed'}${item.sos?' | SOS':''}`,{x:62,y,size:10,font:regular}); y-=15; page.drawText(`Food: ${item.food_timing}`,{x:62,y,size:10,font:regular}); if(item.condition_note){y-=15;page.drawText(`Note: ${item.condition_note}`,{x:62,y,size:10,font:regular});} y-=28; });
  page.drawText(doctorName,{x:410,y:72,size:18,font:italic}); page.drawText('Doctor signature',{x:415,y:54,size:9,font:regular});
  return doc.save();
}
export async function storePrescriptionPdf({key,bytes}) {
  if (!s3) throw new Error('Neon S3 credentials are not configured');
  await s3.send(new PutObjectCommand({Bucket:env.s3.bucket,Key:key,Body:bytes,ContentType:'application/pdf'}));
  const url = env.s3.publicBaseUrl ? `${env.s3.publicBaseUrl.replace(/\/$/,'')}/${key}` : `${env.s3.endpoint.replace(/\/$/,'')}/${env.s3.bucket}/${key}`;
  return url;
}
export async function signedPrescriptionUrl(key) {
  if (!s3) throw new Error('Neon S3 credentials are not configured');
  return getSignedUrl(s3,new (await import('@aws-sdk/client-s3')).GetObjectCommand({Bucket:env.s3.bucket,Key:key}),{expiresIn:900});
}
