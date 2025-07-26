-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE health_metric_status AS ENUM ('normal', 'warning', 'critical');
CREATE TYPE trend_type AS ENUM ('up', 'down', 'stable');
CREATE TYPE urgency_level AS ENUM ('routine', 'soon', 'urgent');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE consultation_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE hospital_type AS ENUM ('government', 'private');
CREATE TYPE availability_type AS ENUM ('24/7', 'day_only');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
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
CREATE TABLE doctors (
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
    certifications TEXT[],
    hospital_affiliations TEXT[],
    available_hours JSONB, -- Store availability schedule
    bio TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    hospital_type hospital_type NOT NULL,
    specialties TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.0,
    availability availability_type DEFAULT '24/7',
    has_emergency BOOLEAN DEFAULT false,
    coordinates GEOGRAPHY(POINT, 4326), -- For location-based queries
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    appointment_type TEXT DEFAULT 'consultation', -- consultation, follow_up, emergency
    reason TEXT,
    symptoms TEXT,
    notes TEXT,
    prescription TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health metrics table
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL, -- blood_pressure, heart_rate, temperature, weight, etc.
    value DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    status health_metric_status DEFAULT 'normal',
    trend trend_type DEFAULT 'stable',
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    device_source TEXT, -- manual, smartwatch, etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL, -- daily, twice_daily, weekly, etc.
    schedule_times TIME[],
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    side_effects TEXT[],
    prescribed_by UUID REFERENCES doctors(id),
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication logs (tracking when medications are taken)
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    taken_at TIMESTAMPTZ,
    was_taken BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptoms table
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity severity_level DEFAULT 'low',
    body_parts TEXT[],
    duration TEXT, -- how long symptoms have been present
    triggers TEXT[],
    analysis_result JSONB, -- AI analysis results
    suggested_conditions TEXT[],
    recommended_actions TEXT[],
    urgency urgency_level DEFAULT 'routine',
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teleconsultations table
CREATE TABLE teleconsultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    session_url TEXT,
    status consultation_status DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    recording_url TEXT,
    prescription TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages for teleconsultations
CREATE TABLE consultation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES teleconsultations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message_type TEXT DEFAULT 'text', -- text, file, prescription, image
    content TEXT NOT NULL,
    file_url TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health trends/alerts table
CREATE TABLE health_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_name TEXT NOT NULL,
    category TEXT NOT NULL, -- disease, environmental, lifestyle, emergency
    current_value DECIMAL(10,2) NOT NULL,
    previous_value DECIMAL(10,2),
    unit TEXT NOT NULL,
    trend trend_type DEFAULT 'stable',
    severity severity_level DEFAULT 'low',
    location TEXT,
    population_affected INTEGER,
    description TEXT,
    date_recorded DATE DEFAULT CURRENT_DATE,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User health alerts/notifications
CREATE TABLE user_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- medication_reminder, appointment_reminder, health_warning, trend_alert
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity severity_level DEFAULT 'low',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicine hub/pharmacy products
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    category TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    manufacturer TEXT,
    requires_prescription BOOLEAN DEFAULT false,
    side_effects TEXT[],
    contraindications TEXT[],
    dosage_forms TEXT[],
    storage_instructions TEXT,
    active_ingredients TEXT[],
    in_stock BOOLEAN DEFAULT true,
    pharmacy_store TEXT,
    store_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance providers and plans
CREATE TABLE insurance_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    coverage_areas TEXT[],
    plan_types TEXT[],
    network_hospitals TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance claims
CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES insurance_providers(id),
    claim_number TEXT UNIQUE NOT NULL,
    treatment_date DATE NOT NULL,
    hospital_name TEXT NOT NULL,
    treatment_type TEXT NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    status TEXT DEFAULT 'submitted', -- submitted, processing, approved, rejected, paid
    documents TEXT[], -- URLs to uploaded documents
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_available ON doctors(is_available);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_health_metrics_user ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_recorded ON health_metrics(recorded_at);
CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_symptoms_user ON symptoms(user_id);
CREATE INDEX idx_symptoms_reported ON symptoms(reported_at);
CREATE INDEX idx_teleconsultations_patient ON teleconsultations(patient_id);
CREATE INDEX idx_teleconsultations_doctor ON teleconsultations(doctor_id);
CREATE INDEX idx_user_alerts_user ON user_alerts(user_id);
CREATE INDEX idx_user_alerts_scheduled ON user_alerts(scheduled_for);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_prescription ON medicines(requires_prescription);

-- Spatial index for hospitals
CREATE INDEX idx_hospitals_location ON hospitals USING GIST (coordinates);

-- Enable Row Level Security (RLS)
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

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Doctors policies
CREATE POLICY "Anyone can view doctors" ON doctors
    FOR SELECT TO authenticated;

CREATE POLICY "Doctors can update their own profile" ON doctors
    FOR UPDATE USING (profile_id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

CREATE POLICY "Patients can create appointments" ON appointments
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (
        patient_id = auth.uid() OR 
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- Health metrics policies
CREATE POLICY "Users can view their own health metrics" ON health_metrics
    FOR ALL USING (user_id = auth.uid());

-- Medications policies
CREATE POLICY "Users can view their own medications" ON medications
    FOR ALL USING (user_id = auth.uid());

-- Medication logs policies
CREATE POLICY "Users can view their own medication logs" ON medication_logs
    FOR ALL USING (user_id = auth.uid());

-- Symptoms policies
CREATE POLICY "Users can view their own symptoms" ON symptoms
    FOR ALL USING (user_id = auth.uid());

-- Teleconsultations policies
CREATE POLICY "Users can view their own teleconsultations" ON teleconsultations
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
    );

-- Consultation messages policies
CREATE POLICY "Users can view messages from their consultations" ON consultation_messages
    FOR SELECT USING (
        consultation_id IN (
            SELECT id FROM teleconsultations 
            WHERE patient_id = auth.uid() OR 
                  doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid())
        )
    );

-- User alerts policies
CREATE POLICY "Users can view their own alerts" ON user_alerts
    FOR ALL USING (user_id = auth.uid());

-- Insurance claims policies
CREATE POLICY "Users can view their own insurance claims" ON insurance_claims
    FOR ALL USING (user_id = auth.uid());

-- Public access policies for reference data
CREATE POLICY "Anyone can view hospitals" ON hospitals FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view medicines" ON medicines FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view health trends" ON health_trends FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view insurance providers" ON insurance_providers FOR SELECT TO authenticated;

-- Functions for automatic updating
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teleconsultations_updated_at BEFORE UPDATE ON teleconsultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON insurance_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
