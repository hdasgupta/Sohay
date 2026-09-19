export const getUserByEmailSql = `SELECT id, name, email, password_hash, role, is_active FROM users WHERE lower(email) = lower($1) LIMIT 1`;
export const getUserByIdSql = `SELECT id, name, email, role, is_active FROM users WHERE id = $1 LIMIT 1`;
export const getPatientByEmailSql = `SELECT id, name, email, role, is_active FROM users WHERE lower(email) = lower($1) AND role = $2 LIMIT 1`;
export const getAdminByEmailSql = `SELECT id FROM users WHERE lower(email) = lower($1) AND role = $2 LIMIT 1`;
export const insertUserSql = `INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role, is_active`;
export const updatePasswordSql = `UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1 RETURNING id`;
export const insertOtpSql = `INSERT INTO otp_codes (id, email, purpose, code_hash, expires_at, verified) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
export const getLatestOtpSql = `SELECT id, code_hash, expires_at, verified FROM otp_codes WHERE lower(email) = lower($1) AND purpose = $2 ORDER BY created_at DESC LIMIT 1`;
export const markOtpVerifiedSql = `UPDATE otp_codes SET verified = $2, verified_at = now() WHERE id = $1 RETURNING id`;
export const hasUsersTableSql = `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2) AS exists`;
export const listMedicineCountSql = `SELECT count(*)::int AS count FROM medicines`;
export const insertMedicineSql = `INSERT INTO medicines (id, name) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING`;

export const insertPatientProfileSql = `INSERT INTO patient_profiles (user_id, sex, contact_number) VALUES ($1,$2,$3)`;
export const insertPatientUserSql = `INSERT INTO users (id,name,email,password_hash,role,is_active,date_of_birth) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,email,role,is_active`;
export const insertDoctorUserSql = `INSERT INTO users (id,name,email,password_hash,role,is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
