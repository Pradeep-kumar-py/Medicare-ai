-- Insert sample hospitals
INSERT INTO hospitals (name, address, phone, hospital_type, specialties, rating, availability, has_emergency, coordinates) VALUES
('Apollo Hospital', 'Sarita Vihar, New Delhi - 110076', '011-26925858', 'private', ARRAY['Cardiology', 'Neurology', 'Emergency'], 4.8, '24/7', true, ST_GeogFromText('POINT(77.2100 28.5672)')),
('Fortis Hospital', 'Sector 62, Noida - 201301', '0120-6200000', 'private', ARRAY['Oncology', 'Cardiac Surgery', 'ICU'], 4.5, '24/7', true, ST_GeogFromText('POINT(77.3910 28.6139)')),
('Max Super Speciality Hospital', 'Saket, New Delhi - 110017', '011-26515050', 'private', ARRAY['Orthopedics', 'Gastroenterology', 'Emergency'], 4.6, '24/7', true, ST_GeogFromText('POINT(77.2066 28.5245)')),
('Safdarjung Hospital', 'Ansari Nagar, New Delhi - 110029', '011-26165060', 'government', ARRAY['Emergency', 'General Medicine', 'Pediatrics'], 4.2, '24/7', true, ST_GeogFromText('POINT(77.2050 28.5672)')),
('BLK Super Speciality Hospital', 'Pusa Road, New Delhi - 110005', '011-30403040', 'private', ARRAY['Liver Transplant', 'Neurosurgery', 'ICU'], 4.4, '24/7', true, ST_GeogFromText('POINT(77.1736 28.6473)'));

-- Insert sample medicines
INSERT INTO medicines (name, generic_name, category, description, price, manufacturer, requires_prescription, side_effects, dosage_forms, in_stock, pharmacy_store, store_url, rating) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Pain Relief', 'Effective pain reliever and fever reducer', 25.00, 'Generic Pharma', false, ARRAY['Nausea', 'Stomach upset'], ARRAY['Tablet', 'Syrup'], true, 'MedPlus', 'https://medplus.in', 4.2),
('Crocin Advance', 'Paracetamol', 'Pain Relief', 'Fast acting pain relief tablets', 45.00, 'GSK', false, ARRAY['Mild stomach irritation'], ARRAY['Tablet'], true, '1mg', 'https://1mg.com', 4.5),
('Azithromycin 500mg', 'Azithromycin', 'Antibiotic', 'Broad-spectrum antibiotic', 120.00, 'Cipla', true, ARRAY['Nausea', 'Diarrhea', 'Stomach pain'], ARRAY['Tablet'], true, 'PharmEasy', 'https://pharmeasy.in', 4.1),
('Omeprazole 20mg', 'Omeprazole', 'Digestive', 'Acid reducer for stomach problems', 45.00, 'Dr. Reddys', false, ARRAY['Headache', 'Nausea'], ARRAY['Capsule'], true, 'Netmeds', 'https://netmeds.com', 4.3),
('Cetirizine 10mg', 'Cetirizine', 'Allergy', 'Antihistamine for allergies', 18.00, 'Generic', false, ARRAY['Drowsiness', 'Dry mouth'], ARRAY['Tablet'], true, 'Apollo Pharmacy', 'https://apollopharmacy.in', 4.0),
('Metformin 500mg', 'Metformin', 'Diabetes', 'Type 2 diabetes management', 65.00, 'Sun Pharma', true, ARRAY['Nausea', 'Diarrhea'], ARRAY['Tablet'], true, 'MedPlus', 'https://medplus.in', 4.4);

-- Insert sample insurance providers
INSERT INTO insurance_providers (name, website, phone, email, coverage_areas, plan_types, network_hospitals) VALUES
('Star Health Insurance', 'https://starhealth.in', '1800-425-2255', 'support@starhealth.in', ARRAY['Pan India'], ARRAY['Individual', 'Family', 'Senior Citizen'], ARRAY['Apollo', 'Fortis', 'Max']),
('HDFC ERGO Health', 'https://hdfcergo.com', '1800-266-0700', 'health@hdfcergo.com', ARRAY['Pan India'], ARRAY['Individual', 'Family', 'Group'], ARRAY['Apollo', 'Max', 'BLK']),
('ICICI Lombard Health', 'https://icicilombard.com', '1800-266-7780', 'health@icicilombard.com', ARRAY['Pan India'], ARRAY['Individual', 'Family', 'Critical Illness'], ARRAY['Fortis', 'Max', 'Safdarjung']),
('Bajaj Allianz Health', 'https://bajajallianz.com', '1800-209-5858', 'health@bajajallianz.co.in', ARRAY['Pan India'], ARRAY['Individual', 'Family', 'Group'], ARRAY['Apollo', 'BLK', 'Fortis']);

-- Insert sample doctor profiles first
INSERT INTO profiles (id, email, full_name, role, phone) VALUES
(gen_random_uuid(), 'dr.sarah.johnson@hospital.com', 'Dr. Sarah Johnson', 'doctor', '+91-9876543210'),
(gen_random_uuid(), 'dr.michael.chen@hospital.com', 'Dr. Michael Chen', 'doctor', '+91-9876543211'),
(gen_random_uuid(), 'dr.emily.rodriguez@hospital.com', 'Dr. Emily Rodriguez', 'doctor', '+91-9876543212'),
(gen_random_uuid(), 'dr.james.wilson@hospital.com', 'Dr. James Wilson', 'doctor', '+91-9876543213'),
(gen_random_uuid(), 'dr.priya.sharma@hospital.com', 'Dr. Priya Sharma', 'doctor', '+91-9876543214');

-- Insert sample doctors (using the profile IDs)
INSERT INTO doctors (profile_id, specialization, license_number, experience_years, consultation_fee, rating, total_consultations, languages, education, certifications, hospital_affiliations, bio, is_available) VALUES
((SELECT id FROM profiles WHERE email = 'dr.sarah.johnson@hospital.com'), 'General Physician', 'MCI-GP-001', 12, 500.00, 4.8, 1250, ARRAY['English', 'Hindi'], ARRAY['MBBS - AIIMS Delhi', 'MD Internal Medicine'], ARRAY['Board Certified Internal Medicine'], ARRAY['Apollo Hospital'], 'Dr. Sarah Johnson is a dedicated general physician with over 12 years of experience in providing comprehensive healthcare.', true),
((SELECT id FROM profiles WHERE email = 'dr.michael.chen@hospital.com'), 'Cardiologist', 'MCI-CARD-002', 15, 800.00, 4.9, 980, ARRAY['English', 'Mandarin'], ARRAY['MBBS - CMC Vellore', 'DM Cardiology'], ARRAY['Board Certified Cardiology'], ARRAY['Fortis Hospital', 'Max Hospital'], 'Experienced cardiologist specializing in interventional cardiology and heart disease prevention.', true),
((SELECT id FROM profiles WHERE email = 'dr.emily.rodriguez@hospital.com'), 'Dermatologist', 'MCI-DERM-003', 8, 600.00, 4.7, 750, ARRAY['English', 'Spanish'], ARRAY['MBBS - KMC Manipal', 'MD Dermatology'], ARRAY['Board Certified Dermatology'], ARRAY['BLK Hospital'], 'Dermatologist with expertise in cosmetic dermatology and skin cancer treatment.', true),
((SELECT id FROM profiles WHERE email = 'dr.james.wilson@hospital.com'), 'Pediatrician', 'MCI-PED-004', 20, 550.00, 4.9, 2100, ARRAY['English'], ARRAY['MBBS - JIPMER', 'MD Pediatrics'], ARRAY['Board Certified Pediatrics'], ARRAY['Safdarjung Hospital'], 'Pediatrician with two decades of experience in child healthcare and development.', true),
((SELECT id FROM profiles WHERE email = 'dr.priya.sharma@hospital.com'), 'Gynecologist', 'MCI-GYN-005', 10, 650.00, 4.6, 890, ARRAY['English', 'Hindi'], ARRAY['MBBS - MAMC Delhi', 'MS Obstetrics & Gynecology'], ARRAY['Board Certified OB-GYN'], ARRAY['Apollo Hospital', 'Max Hospital'], 'Gynecologist specializing in women\'s health, pregnancy care, and minimally invasive surgery.', true);

-- Insert sample health trends
INSERT INTO health_trends (trend_name, category, current_value, previous_value, unit, trend, severity, location, population_affected, description, source) VALUES
('Flu Cases', 'disease', 1250, 980, 'cases', 'up', 'high', 'Downtown District', 45000, 'Significant increase in flu cases over the past month', 'Health Department'),
('Air Quality Index', 'environmental', 85, 72, 'AQI', 'up', 'medium', 'City-wide', 500000, 'Air quality has declined due to increased traffic', 'EPA'),
('Allergy Reports', 'disease', 890, 1200, 'cases', 'down', 'low', 'Suburban Areas', 75000, 'Pollen levels decreasing as season changes', 'Allergy Centers'),
('Heat-related Illness', 'environmental', 45, 28, 'cases', 'up', 'medium', 'Regional', 200000, 'Rising temperatures leading to more heat-related health issues', 'Regional Health'),
('Emergency Room Visits', 'emergency', 320, 285, 'visits/day', 'up', 'medium', 'Metro Area', 800000, 'Slight increase in ER visits across metro hospitals', 'Hospital Network'),
('Mental Health Consultations', 'lifestyle', 540, 480, 'sessions', 'up', 'low', 'City-wide', 500000, 'Increased awareness leading to more mental health support', 'Mental Health Centers');

-- Create a sample profile function that will be called when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'patient');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
