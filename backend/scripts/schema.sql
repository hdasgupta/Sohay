BEGIN;

DO $$ BEGIN CREATE TYPE appointment_status AS ENUM ('scheduled','rescheduled','cancelled','completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE family_membership_status AS ENUM ('pending','accepted','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE otp_purpose AS ENUM ('registration','password_reset','family_invite'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','patient','doctor')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  date_of_birth DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS patient_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sex TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS doctor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sex TEXT NOT NULL,
  speciality TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS doctor_availability (
  id UUID PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE (doctor_id,weekday,start_time,end_time)
);
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  purpose otp_purpose NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_patient_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status family_membership_status NOT NULL,
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id),
  beneficiary_patient_id UUID NOT NULL REFERENCES users(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  appointment_date DATE NOT NULL,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  status appointment_status NOT NULL,
  room_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY,
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  beneficiary_patient_id UUID NOT NULL REFERENCES users(id),
  prescription_date DATE NOT NULL,
  age INTEGER NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dose TEXT NOT NULL,
  condition_note TEXT,
  morning BOOLEAN NOT NULL DEFAULT FALSE,
  afternoon BOOLEAN NOT NULL DEFAULT FALSE,
  evening BOOLEAN NOT NULL DEFAULT FALSE,
  night BOOLEAN NOT NULL DEFAULT FALSE,
  sos BOOLEAN NOT NULL DEFAULT FALSE,
  food_timing TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_doctor_slot ON appointments (doctor_id,appointment_date,slot_start) WHERE status IN ('scheduled','rescheduled');
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_booking_user_slot ON appointments (patient_id,appointment_date,slot_start) WHERE status IN ('scheduled','rescheduled');
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_patient_slot ON appointments (beneficiary_patient_id,appointment_date,slot_start) WHERE status IN ('scheduled','rescheduled');
CREATE UNIQUE INDEX IF NOT EXISTS uq_family_patient ON family_members (family_id,patient_id);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role,is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id,appointment_date DESC,slot_start DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id,appointment_date DESC,slot_start DESC);
CREATE INDEX IF NOT EXISTS idx_otp_lookup ON otp_codes(email,purpose,created_at DESC);

COMMIT;
