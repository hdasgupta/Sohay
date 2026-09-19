import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
for (const key of required) {
  if (!process.env[key]) console.warn(`[config] Missing environment variable: ${key}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 10000),
  databaseUrl: process.env.DATABASE_URL || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  enableInternalCron: String(process.env.ENABLE_INTERNAL_CRON || 'false') === 'true',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  adminEmail: (process.env.ADMIN_EMAIL || 'wbffmh@gmail.com').toLowerCase().trim(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || ''
  },
  otpMinutes: Number(process.env.OTP_MINUTES || 10),
  s3: {
    endpoint: process.env.AWS_ENDPOINT_URL_S3 || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-southeast-1',
    bucket: process.env.AWS_S3_BUCKET || 'prescriptions',
    publicBaseUrl: process.env.AWS_PUBLIC_BASE_URL || ''
  },
  jaas: {
    appId: process.env.JAAS_APP_ID || '',
    keyId: process.env.JAAS_KEY_ID || '',
    privateKeyBase64: process.env.JAAS_PRIVATE_KEY_BASE64 || '',
    tenant: process.env.JAAS_TENANT || '',
    domain: process.env.JAAS_DOMAIN || '8x8.vc',
    webhookSecret: process.env.JAAS_WEBHOOK_SECRET || '',
    recordingAllowedHosts: (process.env.JAAS_RECORDING_ALLOWED_HOSTS || '8x8.vc,jitsi.net').split(',').map(x=>x.trim()).filter(Boolean)
  },
  google: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '',
    targetEmail: process.env.GOOGLE_DRIVE_TARGET_EMAIL || 'himaghna.dasgupta@gmail.com',
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  },
  medicineDatasetUrl: process.env.MEDICINE_DATASET_URL || ''
};
