-- Test script to verify appointment system setup
-- Run this in Supabase SQL editor to check system status

-- 1. Check if we have doctors in the system
SELECT 
  d.id,
  d.specialization,
  d.is_available,
  p.full_name,
  p.email,
  p.role
FROM doctors d
LEFT JOIN profiles p ON d.profile_id = p.id
ORDER BY d.created_at DESC;

-- 2. Check recent appointments
SELECT 
  a.id,
  a.appointment_date,
  a.appointment_time,
  a.status,
  a.appointment_type,
  patient.full_name as patient_name,
  patient.email as patient_email,
  doctor.specialization as doctor_specialization
FROM appointments a
LEFT JOIN profiles patient ON a.patient_id = patient.id
LEFT JOIN doctors doctor ON a.doctor_id = doctor.id
WHERE a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date, a.appointment_time;

-- 3. Check user profiles and roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Test appointment creation (sample data)
-- Uncomment and modify IDs as needed
/*
INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  appointment_time,
  appointment_type,
  reason,
  status
) VALUES (
  '[PATIENT_ID]',  -- Replace with actual patient ID
  '[DOCTOR_ID]',   -- Replace with actual doctor ID
  CURRENT_DATE + INTERVAL '1 day',
  '10:00',
  'consultation',
  'General checkup',
  'scheduled'
);
*/

-- 5. Count statistics
SELECT 
  'Total Doctors' as metric,
  COUNT(*) as count
FROM doctors
WHERE is_available = true

UNION ALL

SELECT 
  'Total Appointments Today+' as metric,
  COUNT(*) as count
FROM appointments
WHERE appointment_date >= CURRENT_DATE

UNION ALL

SELECT 
  'Total Patients' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'patient'

UNION ALL

SELECT 
  'Total Doctor Profiles' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'doctor';
