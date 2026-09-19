import { google } from 'googleapis';
import { env } from '../config/env.js';
import { Readable } from 'node:stream';

export async function uploadRecordingToDrive({name,buffer,mimeType='video/mp4'}) {
  if (!env.google.clientId || !env.google.clientSecret || !env.google.refreshToken) throw new Error('Google Drive OAuth credentials are not configured');
  const auth = new google.auth.OAuth2(env.google.clientId,env.google.clientSecret);
  auth.setCredentials({refresh_token:env.google.refreshToken});
  const drive = google.drive({version:'v3',auth});
  const result = await drive.files.create({ requestBody:{name,parents:env.google.folderId?[env.google.folderId]:undefined}, media:{mimeType,body:Readable.from(buffer)}, fields:'id,webViewLink' });
  console.log('[drive] uploaded', result.data.id, env.google.targetEmail);
  return result.data;
}
