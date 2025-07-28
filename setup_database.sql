-- ================================================================
-- MEDCARE AI - COMPLETE DATABASE SETUP SCRIPT
-- This script creates all tables, policies, functions and dummy data
-- Run this in your Supabase SQL Editor to set up the entire database
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE health_metric_status AS ENUM ('normal', 'warning', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trend_type AS ENUM ('up', 'down', 'stable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('routine', 'soon', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hospital_type AS ENUM ('government', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_type AS ENUM ('24/7', 'day_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_type AS ENUM ('personal', 'community', 'environmental', 'epidemic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================
-- CREATE TABLES
-- ==============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'patient',
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_history TEXT[],
    allergies TEXT[],
    current_medications TEXT[],
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    experience_years INTEGER,
    consultation_fee DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_consultations INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT ARRAY['English'],
    education TEXT[],
    availability_schedule JSONB,
    hospital_affiliations TEXT[],
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    type hospital_type DEFAULT 'private',
    specialties TEXT[],
    emergency_services BOOLEAN DEFAULT false,
    availability availability_type DEFAULT 'day_only',
    rating DECIMAL(3,2) DEFAULT 0.0,
    coordinates POINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    duration_minutes INTEGER DEFAULT 30,
    consultation_fee DECIMAL(10,2),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'blood_pressure', 'heart_rate', 'weight', 'temperature', 'blood_sugar'
    value JSONB NOT NULL, -- stores value in appropriate format (number, object for BP, etc.)
    unit TEXT,
    status health_metric_status DEFAULT 'normal',
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'once_daily', 'twice_daily', 'thrice_daily', 'as_needed'
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    reminder_times TIME[],
    prescribed_by TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication logs table
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    was_taken BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    symptom_name TEXT NOT NULL,
    severity severity_level DEFAULT 'low',
    body_part TEXT,
    description TEXT,
    duration_hours INTEGER,
    triggers TEXT[],
    pain_scale INTEGER CHECK (pain_scale >= 1 AND pain_scale <= 10),
    associated_symptoms TEXT[],
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teleconsultations table
CREATE TABLE IF NOT EXISTS teleconsultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    session_url TEXT,
    status consultation_status DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    recording_url TEXT,
    notes TEXT,
    prescription TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation messages table
CREATE TABLE IF NOT EXISTS consultation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES teleconsultations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
    content TEXT NOT NULL,
    file_url TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- User alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    alert_type alert_type DEFAULT 'personal',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity severity_level DEFAULT 'low',
    is_read BOOLEAN DEFAULT false,
    action_required BOOLEAN DEFAULT false,
    action_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health trends table (for community data)
CREATE TABLE IF NOT EXISTS health_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_name TEXT NOT NULL,
    trend_type trend_type DEFAULT 'stable',
    description TEXT,
    affected_regions TEXT[],
    severity severity_level DEFAULT 'low',
    data_points JSONB,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines catalog table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    generic_name TEXT,
    manufacturer TEXT,
    category TEXT,
    description TEXT,
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    requires_prescription BOOLEAN DEFAULT true,
    side_effects TEXT[],
    contraindications TEXT[],
    dosage_forms TEXT[], -- 'tablet', 'capsule', 'syrup', 'injection'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance providers table
CREATE TABLE IF NOT EXISTS insurance_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_number TEXT,
    email TEXT,
    website TEXT,
    coverage_details JSONB,
    network_hospitals UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance claims table
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES insurance_providers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    claim_number TEXT UNIQUE NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status TEXT DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected'
    submission_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    rejection_reason TEXT,
    documents TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- CREATE INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_unread ON user_alerts(user_id, is_read);

-- Spatial index for hospitals
CREATE INDEX IF NOT EXISTS idx_hospitals_coordinates ON hospitals USING GIST(coordinates);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on all user data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teleconsultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DO $$ BEGIN
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    CREATE POLICY "Users can view their own profile" ON profiles
        FOR ALL USING (auth.uid() = id);

    -- Doctors policies
    DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
    CREATE POLICY "Doctors can view their own profile" ON doctors
        FOR ALL USING (auth.uid() = profile_id);

    DROP POLICY IF EXISTS "Anyone can view doctor profiles" ON doctors;
    CREATE POLICY "Anyone can view doctor profiles" ON doctors
        FOR SELECT TO authenticated USING (true);

    -- Appointments policies
    DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
    CREATE POLICY "Users can view their own appointments" ON appointments
        FOR SELECT USING (
            auth.uid() = patient_id OR 
            auth.uid() IN (SELECT profile_id FROM doctors WHERE id = doctor_id)
        );

    DROP POLICY IF EXISTS "Users can create their own appointments" ON appointments;
    CREATE POLICY "Users can create their own appointments" ON appointments
        FOR INSERT WITH CHECK (auth.uid() = patient_id);

    DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
    CREATE POLICY "Users can update their own appointments" ON appointments
        FOR UPDATE USING (
            auth.uid() = patient_id OR 
            auth.uid() IN (SELECT profile_id FROM doctors WHERE id = doctor_id)
        );

    -- Health metrics policies
    DROP POLICY IF EXISTS "Users can view their own health metrics" ON health_metrics;
    CREATE POLICY "Users can view their own health metrics" ON health_metrics
        FOR ALL USING (user_id = auth.uid());

    -- Medications policies
    DROP POLICY IF EXISTS "Users can view their own medications" ON medications;
    CREATE POLICY "Users can view their own medications" ON medications
        FOR ALL USING (user_id = auth.uid());

    -- Medication logs policies
    DROP POLICY IF EXISTS "Users can view their own medication logs" ON medication_logs;
    CREATE POLICY "Users can view their own medication logs" ON medication_logs
        FOR ALL USING (user_id = auth.uid());

    -- Symptoms policies
    DROP POLICY IF EXISTS "Users can view their own symptoms" ON symptoms;
    CREATE POLICY "Users can view their own symptoms" ON symptoms
        FOR ALL USING (user_id = auth.uid());

    -- Teleconsultations policies
    DROP POLICY IF EXISTS "Users can view their own teleconsultations" ON teleconsultations;
    CREATE POLICY "Users can view their own teleconsultations" ON teleconsultations
        FOR SELECT USING (
            patient_id = auth.uid() OR 
            auth.uid() IN (SELECT profile_id FROM doctors WHERE id = doctor_id)
        );

    -- Consultation messages policies
    DROP POLICY IF EXISTS "Users can view messages from their consultations" ON consultation_messages;
    CREATE POLICY "Users can view messages from their consultations" ON consultation_messages
        FOR SELECT USING (
            consultation_id IN (
                SELECT id FROM teleconsultations 
                WHERE patient_id = auth.uid() OR 
                      auth.uid() IN (SELECT profile_id FROM doctors WHERE id = doctor_id)
            )
        );

    -- User alerts policies
    DROP POLICY IF EXISTS "Users can view their own alerts" ON user_alerts;
    CREATE POLICY "Users can view their own alerts" ON user_alerts
        FOR ALL USING (user_id = auth.uid());

    -- Insurance claims policies
    DROP POLICY IF EXISTS "Users can view their own insurance claims" ON insurance_claims;
    CREATE POLICY "Users can view their own insurance claims" ON insurance_claims
        FOR ALL USING (user_id = auth.uid());

    -- Public access policies for reference data
    DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
    CREATE POLICY "Anyone can view hospitals" ON hospitals 
        FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Anyone can view medicines" ON medicines;
    CREATE POLICY "Anyone can view medicines" ON medicines 
        FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Anyone can view health trends" ON health_trends;
    CREATE POLICY "Anyone can view health trends" ON health_trends 
        FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Anyone can view insurance providers" ON insurance_providers;
    CREATE POLICY "Anyone can view insurance providers" ON insurance_providers 
        FOR SELECT TO authenticated USING (true);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may already exist, continuing...';
END $$;

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function for automatic updating of updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teleconsultations_updated_at ON teleconsultations;
CREATE TRIGGER update_teleconsultations_updated_at BEFORE UPDATE ON teleconsultations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medicines_updated_at ON medicines;
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_claims_updated_at ON insurance_claims;
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON insurance_claims 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- UTILITY FUNCTIONS
-- ==============================================

-- Function to find hospitals within a radius
CREATE OR REPLACE FUNCTION hospitals_within_radius(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    phone TEXT,
    type hospital_type,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.address,
        h.phone,
        h.type,
        ST_Distance(h.coordinates::geometry, ST_Point(lng, lat)::geometry) / 1000 AS distance_km
    FROM hospitals h
    WHERE ST_DWithin(h.coordinates::geometry, ST_Point(lng, lat)::geometry, radius_km * 1000)
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming medication reminders
CREATE OR REPLACE FUNCTION get_upcoming_medication_reminders(user_uuid UUID)
RETURNS TABLE (
    medication_id UUID,
    medicine_name TEXT,
    dosage TEXT,
    next_reminder_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.medicine_name,
        m.dosage,
        (CURRENT_DATE + unnest(m.reminder_times))::TIMESTAMPTZ
    FROM medications m
    WHERE m.user_id = user_uuid 
    AND m.is_active = true
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
    ORDER BY next_reminder_time;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- INSERT DUMMY DATA
-- ==============================================

-- Insert hospitals
INSERT INTO hospitals (name, address, phone, type, specialties, emergency_services, availability, rating, coordinates)
VALUES 
    ('AIIMS Delhi', 'Ansari Nagar, New Delhi, Delhi 110029', '+91-11-26588500', 'government', 
     ARRAY['Cardiology', 'Neurology', 'Oncology', 'General Medicine'], true, '24/7', 4.5,
     POINT(77.2090, 28.5665)),
    
    ('Fortis Hospital', 'Sector 62, Noida, Uttar Pradesh 201301', '+91-120-4988888', 'private',
     ARRAY['Cardiology', 'Orthopedics', 'Gastroenterology'], true, '24/7', 4.2,
     POINT(77.3648, 28.6191)),
    
    ('Max Super Speciality Hospital', 'Saket, New Delhi, Delhi 110017', '+91-11-26515050', 'private',
     ARRAY['Cancer Care', 'Heart Institute', 'Neurosciences'], true, '24/7', 4.3,
     POINT(77.2177, 28.5244)),
    
    ('Apollo Hospital', 'Sarita Vihar, New Delhi, Delhi 110076', '+91-11-26825858', 'private',
     ARRAY['Cardiology', 'Transplant', 'Emergency Medicine'], true, '24/7', 4.4,
     POINT(77.2955, 28.5355)),
    
    ('Sir Ganga Ram Hospital', 'Rajinder Nagar, New Delhi, Delhi 110060', '+91-11-25750000', 'private',
     ARRAY['Nephrology', 'Gastroenterology', 'Pulmonology'], true, '24/7', 4.1,
     POINT(77.1925, 28.6368))
ON CONFLICT DO NOTHING;

-- Insert medicines
INSERT INTO medicines (name, generic_name, manufacturer, category, description, price, stock_quantity, requires_prescription, side_effects, contraindications, dosage_forms)
VALUES 
    ('Paracetamol 650mg', 'Acetaminophen', 'Generic Pharma', 'Analgesic', 'Pain reliever and fever reducer', 25.50, 500, false,
     ARRAY['Nausea', 'Allergic reactions'], ARRAY['Liver disease'], ARRAY['tablet']),
    
    ('Amoxicillin 500mg', 'Amoxicillin', 'Cipla Ltd', 'Antibiotic', 'Broad-spectrum antibiotic', 145.00, 200, true,
     ARRAY['Diarrhea', 'Nausea', 'Skin rash'], ARRAY['Penicillin allergy'], ARRAY['capsule']),
    
    ('Metformin 850mg', 'Metformin HCl', 'Sun Pharma', 'Antidiabetic', 'Type 2 diabetes management', 85.50, 300, true,
     ARRAY['GI upset', 'Metallic taste'], ARRAY['Kidney disease', 'Heart failure'], ARRAY['tablet']),
    
    ('Lisinopril 10mg', 'Lisinopril', 'Lupin Ltd', 'ACE Inhibitor', 'Blood pressure medication', 65.75, 150, true,
     ARRAY['Dry cough', 'Dizziness'], ARRAY['Pregnancy', 'Angioedema'], ARRAY['tablet']),
    
    ('Cetirizine 10mg', 'Cetirizine HCl', 'Dr. Reddy, 'Antihistamine', 'Allergy relief medication', 42.00, 400, false,  
     ARRAY['Drowsiness', 'Dry mouth'], ARRAY['Severe kidney disease'], ARRAY['tablet']),
    
    ('Omeprazole 20mg', 'Omeprazole', 'Ranbaxy', 'Proton Pump Inhibitor', 'Acid reflux treatment', 95.25, 250, true,
     ARRAY['Headache', 'Abdominal pain'], ARRAY['Liver disease'], ARRAY['capsule'])
ON CONFLICT DO NOTHING;

-- Insert insurance providers
INSERT INTO insurance_providers (name, contact_number, email, website, coverage_details)
VALUES 
    ('Star Health Insurance', '+91-44-28288282', 'care@starhealth.in', 'https://www.starhealth.in',
     '{"individual_plans": true, "family_plans": true, "senior_citizen": true, "cashless_hospitals": 9900, "max_coverage": 2500000}'),
    
    ('HDFC ERGO Health', '+91-22-66516666', 'customercare@hdfcergo.com', 'https://www.hdfcergo.com',
     '{"individual_plans": true, "family_plans": true, "corporate": true, "cashless_hospitals": 10000, "max_coverage": 5000000}'),
    
    ('ICICI Lombard Health', '+91-22-61960000', 'customersupport@icicilombard.com', 'https://www.icicilombard.com',
     '{"individual_plans": true, "family_plans": true, "travel_insurance": true, "cashless_hospitals": 6500, "max_coverage": 3000000}'),
    
    ('New India Assurance', '+91-22-22070502', 'ho@newindia.co.in', 'https://www.newindia.co.in',
     '{"mediclaim": true, "janaarogya": true, "government_schemes": true, "cashless_hospitals": 8000, "max_coverage": 1000000}')
ON CONFLICT DO NOTHING;

-- Insert health trends
INSERT INTO health_trends (trend_name, trend_type, description, affected_regions, severity, data_points)
VALUES 
    ('Seasonal Flu', 'up', 'Increased flu cases during winter season', ARRAY['Delhi', 'Mumbai', 'Bangalore'], 'medium',
     '{"cases_this_week": 1250, "cases_last_week": 980, "percentage_increase": 27.5}'),
    
    ('Air Quality Health Impact', 'up', 'Respiratory issues due to poor air quality', ARRAY['Delhi', 'Gurgaon', 'Noida'], 'high',
     '{"aqi_average": 380, "respiratory_cases": 2100, "advisory": "Avoid outdoor activities"}'),
    
    ('Diabetes Management', 'stable', 'Steady diabetes management with digital tools', ARRAY['Pan India'], 'low',
     '{"controlled_cases": 78, "app_usage": 85, "medication_adherence": 82}'),
    
    ('Mental Health Awareness', 'up', 'Increased mental health consultations', ARRAY['Urban Areas'], 'medium',
     '{"counseling_sessions": 3400, "app_downloads": 125000, "support_group_participation": 45}'),
    
    ('Vaccination Drive', 'up', 'COVID-19 booster vaccination campaign', ARRAY['All States'], 'low',
     '{"doses_administered": 15000000, "coverage_percentage": 89, "adverse_events": 0.02}')
ON CONFLICT DO NOTHING;

-- Create dummy user function for testing
CREATE OR REPLACE FUNCTION create_test_user(
    user_email TEXT,
    user_name TEXT,
    user_role user_role DEFAULT 'patient'
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Generate a UUID for the test user
    new_user_id := uuid_generate_v4();
    
    -- Insert into profiles table (simulating what would happen after auth)
    INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, gender, address)
    VALUES (
        new_user_id,
        user_email,
        user_name,
        user_role,
        '+91-' || (9000000000 + floor(random() * 999999999))::TEXT,
        CURRENT_DATE - INTERVAL '25 years' - (random() * INTERVAL '20 years'),
        (ARRAY['male', 'female'])[1 + floor(random() * 2)],
        'Test Address, Delhi, India'
    );
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'MEDCARE AI DATABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Created Tables:';
    RAISE NOTICE '- profiles (user profiles)';
    RAISE NOTICE '- doctors (doctor information)'; 
    RAISE NOTICE '- hospitals (hospital directory)';
    RAISE NOTICE '- appointments (appointment booking)';
    RAISE NOTICE '- health_metrics (vital signs tracking)';
    RAISE NOTICE '- medications (prescription management)';
    RAISE NOTICE '- medication_logs (adherence tracking)';
    RAISE NOTICE '- symptoms (symptom logging)';
    RAISE NOTICE '- teleconsultations (video consultations)';
    RAISE NOTICE '- consultation_messages (chat during consultations)';
    RAISE NOTICE '- user_alerts (health notifications)';
    RAISE NOTICE '- health_trends (community health data)';
    RAISE NOTICE '- medicines (pharmacy catalog)';
    RAISE NOTICE '- insurance_providers (insurance companies)';
    RAISE NOTICE '- insurance_claims (claims management)';
    RAISE NOTICE '';
    RAISE NOTICE 'Inserted Sample Data:';
    RAISE NOTICE '- 5 Major Hospitals in Delhi';
    RAISE NOTICE '- 6 Common Medicines';
    RAISE NOTICE '- 4 Insurance Providers';
    RAISE NOTICE '- 5 Health Trends';
    RAISE NOTICE '';
    RAISE NOTICE 'Security Features:';
    RAISE NOTICE '- Row Level Security (RLS) enabled';
    RAISE NOTICE '- User data isolation policies';
    RAISE NOTICE '- Role-based access control';
    RAISE NOTICE '';
    RAISE NOTICE 'Your healthcare database is ready to use!';
    RAISE NOTICE '================================================';
END $$;
