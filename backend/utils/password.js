import bcrypt from 'bcryptjs';

export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]{8,}$/;

export function validatePassword(value) {
  return PASSWORD_RE.test(value || '');
}

export async function hashPassword(value) {
  return bcrypt.hash(value, 12);
}

export async function comparePassword(value, hash) {
  return bcrypt.compare(value, hash);
}
