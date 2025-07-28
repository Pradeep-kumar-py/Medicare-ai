`-- ================================================================
-- ADD SAMPLE DOCTORS TO MEDCARE AI DATABASE
-- This script adds realistic doctor profiles for appointment booking
-- Run this in your Supabase SQL Editor after the main setup
-- ================================================================

-- First, create sample doctor profiles in the profiles table
-- Note: In a real app, these would be created through registration
-- For testing, we'll create mock profile entries

-- Create sample doctor profiles
INSERT INTO profiles (id, email, full_name, role, phone, gender, address, preferred_language)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'dr.sharma@medcare.ai', 'Dr. Rajesh Sharma', 'doctor', '+91-9876543210', 'male', 'AIIMS Delhi, New Delhi', 'en'),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'dr.priya@medcare.ai', 'Dr. Priya Verma', 'doctor', '+91-9876543211', 'female', 'Max Hospital, Saket, Delhi', 'en'),
    ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'dr.kumar@medcare.ai', 'Dr. Amit Kumar', 'doctor', '+91-9876543212', 'male', 'Fortis Hospital, Noida', 'en'),
    ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'dr.singh@medcare.ai', 'Dr. Meera Singh', 'doctor', '+91-9876543213', 'female', 'Apollo Hospital, Delhi', 'en'),
    ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'dr.gupta@medcare.ai', 'Dr. Vikram Gupta', 'doctor', '+91-9876543214', 'male', 'Sir Ganga Ram Hospital, Delhi', 'en'),
    ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'dr.rao@medcare.ai', 'Dr. Sneha Rao', 'doctor', '+91-9876543215', 'female', 'AIIMS Delhi, New Delhi', 'en')
ON CONFLICT (id) DO NOTHING;

-- Now create detailed doctor records
INSERT INTO doctors (profile_id, specialization, license_number, experience_years, consultation_fee, rating, total_consultations, languages, education, availability_schedule, hospital_affiliations, bio)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Cardiology', 'DL-CARD-2018-001', 15, 1500.00, 4.8, 2500,
     ARRAY['English', 'Hindi'], 
     ARRAY['MBBS - AIIMS Delhi', 'MD Cardiology - AIIMS Delhi', 'Fellowship in Interventional Cardiology'],
     '{"monday": ["09:00", "17:00"], "tuesday": ["09:00", "17:00"], "wednesday": ["09:00", "17:00"], "thursday": ["09:00", "17:00"], "friday": ["09:00", "17:00"], "saturday": ["09:00", "13:00"]}',
     ARRAY['AIIMS Delhi', 'Max Hospital Saket'],
     'Dr. Rajesh Sharma is a renowned cardiologist with over 15 years of experience in interventional cardiology. He specializes in complex cardiac procedures and has performed over 3000 successful angioplasties.'),
    
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Dermatology', 'DL-DERM-2019-002', 8, 1200.00, 4.6, 1800,
     ARRAY['English', 'Hindi'], 
     ARRAY['MBBS - Lady Hardinge Medical College', 'MD Dermatology - AIIMS Delhi'],
     '{"monday": ["10:00", "18:00"], "tuesday": ["10:00", "18:00"], "wednesday": ["10:00", "18:00"], "thursday": ["10:00", "18:00"], "friday": ["10:00", "18:00"], "saturday": ["10:00", "14:00"]}',
     ARRAY['Max Hospital Saket', 'Fortis Hospital Noida'],
     'Dr. Priya Verma is a skilled dermatologist specializing in cosmetic dermatology and skin cancer treatment. She is known for her gentle approach and latest treatment techniques.'),
    
    ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Orthopedics', 'DL-ORTHO-2017-003', 12, 1800.00, 4.7, 2200,
     ARRAY['English', 'Hindi'], 
     ARRAY['MBBS - Maulana Azad Medical College', 'MS Orthopedics - AIIMS Delhi', 'Fellowship in Joint Replacement'],
     '{"monday": ["08:00", "16:00"], "tuesday": ["08:00", "16:00"], "wednesday": ["08:00", "16:00"], "thursday": ["08:00", "16:00"], "friday": ["08:00", "16:00"], "saturday": ["08:00", "12:00"]}',
     ARRAY['Fortis Hospital Noida', 'Max Hospital Saket'],
     'Dr. Amit Kumar is an expert orthopedic surgeon with extensive experience in joint replacement surgeries and sports medicine. He has successfully performed over 1500 joint replacement surgeries.'),
    
    ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Pediatrics', 'DL-PEDI-2020-004', 6, 1000.00, 4.9, 1500,
     ARRAY['English', 'Hindi'], 
     ARRAY['MBBS - Delhi University', 'MD Pediatrics - AIIMS Delhi'],
     '{"monday": ["09:00", "17:00"], "tuesday": ["09:00", "17:00"], "wednesday": ["09:00", "17:00"], "thursday": ["09:00", "17:00"], "friday": ["09:00", "17:00"], "saturday": ["09:00", "13:00"]}',
     ARRAY['Apollo Hospital Delhi', 'Sir Ganga Ram Hospital'],
     'Dr. Meera Singh is a compassionate pediatrician who specializes in child development and preventive care. She is known for her excellent rapport with children and their families.'),
    
    ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Neurology', 'DL-NEURO-2016-005', 18, 2000.00, 4.5, 3000,
     ARRAY['English', 'Hindi'], 
     ARRAY['MBBS - AIIMS Delhi', 'MD Medicine - AIIMS Delhi', 'DM Neurology - AIIMS Delhi'],
     '{"monday": ["10:00", "18:00"], "tuesday": ["10:00", "18:00"], "wednesday": ["10:00", "18:00"], "thursday": ["10:00", "18:00"], "friday": ["10:00", "18:00"], "saturday": ["10:00", "14:00"]}',
     ARRAY['Sir Ganga Ram Hospital', 'AIIMS Delhi'],
     'Dr. Vikram Gupta is a leading neurologist with expertise in stroke management and epilepsy treatment. He has been instrumental in setting up comprehensive stroke units in multiple hospitals.'),
    
    ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'Gynecology', 'DL-GYNO-2021-006', 5, 1300.00, 4.4, 1200,
     ARRAY['English', 'Hindi'], 
     ARRAY['MBBS - Lady Hardinge Medical College', 'MS Gynecology - AIIMS Delhi'],
     '{"monday": ["09:00", "17:00"], "tuesday": ["09:00", "17:00"], "wednesday": ["09:00", "17:00"], "thursday": ["09:00", "17:00"], "friday": ["09:00", "17:00"], "saturday": ["09:00", "13:00"]}',
     ARRAY['AIIMS Delhi', 'Max Hospital Saket'],
     'Dr. Sneha Rao is a dedicated gynecologist specializing in high-risk pregnancies and minimally invasive surgeries. She is committed to providing comprehensive womens healthcare.')
ON CONFLICT (license_number) DO NOTHING;

-- Add some available appointment slots for testing
-- Note: This creates appointments in the future for demo purposes
INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, duration_minutes, consultation_fee)
SELECT 
    NULL as patient_id, -- Available slots (no patient assigned yet)
    d.id as doctor_id,
    (CURRENT_DATE + INTERVAL '1 day' + (generate_series(0, 6) || ' days')::interval + 
     (ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'])[1 + floor(random() * 6)]::time) as appointment_date,
    'scheduled' as status,
    'Available' as reason,
    30 as duration_minutes,
    d.consultation_fee
FROM doctors d
CROSS JOIN generate_series(0, 6) -- Next 7 days
LIMIT 42; -- 6 doctors × 7 days = 42 slots

-- Update doctor ratings and consultation counts
UPDATE doctors SET 
    rating = 4.0 + (random() * 1.0), -- Random rating between 4.0 and 5.0
    total_consultations = 500 + floor(random() * 2000) -- Random consultations between 500-2500
WHERE profile_id IN (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440006'::uuid
);

-- Verification queries (uncomment to test)
/*
-- Check if doctors were created successfully
SELECT 
    p.full_name,
    d.specialization,
    d.consultation_fee,
    d.rating,
    d.total_consultations
FROM doctors d
JOIN profiles p ON d.profile_id = p.id
ORDER BY d.specialization;

-- Check available appointment slots
SELECT 
    p.full_name as doctor_name,
    d.specialization,
    a.appointment_date,
    a.consultation_fee
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
JOIN profiles p ON d.profile_id = p.id
WHERE a.patient_id IS NULL
ORDER BY a.appointment_date
LIMIT 10;
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SAMPLE DOCTORS ADDED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added 6 doctors with specializations:';
    RAISE NOTICE '- Dr. Rajesh Sharma (Cardiology)';
    RAISE NOTICE '- Dr. Priya Verma (Dermatology)';
    RAISE NOTICE '- Dr. Amit Kumar (Orthopedics)';
    RAISE NOTICE '- Dr. Meera Singh (Pediatrics)';
    RAISE NOTICE '- Dr. Vikram Gupta (Neurology)';
    RAISE NOTICE '- Dr. Sneha Rao (Gynecology)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features added:';
    RAISE NOTICE '- Complete doctor profiles with experience';
    RAISE NOTICE '- Available appointment slots for next 7 days';
    RAISE NOTICE '- Realistic consultation fees and ratings';
    RAISE NOTICE '- Hospital affiliations and schedules';
    RAISE NOTICE '';
    RAISE NOTICE 'Your appointment booking page should now show these doctors!';
    RAISE NOTICE '========================================';
END $$;
