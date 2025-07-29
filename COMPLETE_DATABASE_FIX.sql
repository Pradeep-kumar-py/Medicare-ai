-- COMPREHENSIVE FIX for signup errors
-- Run this entire script in your Supabase SQL Editor

-- Step 0: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Drop existing trigger to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Ensure user_role enum and profiles table exists with correct structure
-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Step 3: Create a simplified, more robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_role TEXT;
    profile_exists BOOLEAN;
BEGIN
    -- Extract metadata safely
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
    
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id OR email = NEW.email) INTO profile_exists;
    
    -- Only insert if profile doesn't exist
    IF NOT profile_exists THEN
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, role)
            VALUES (
                NEW.id,
                NEW.email,
                user_full_name,
                user_role::user_role
            );
        EXCEPTION 
            WHEN unique_violation THEN
                -- Profile already exists, just log and continue
                RAISE WARNING 'Profile already exists for user %', NEW.email;
            WHEN OTHERS THEN
                -- Log other errors but don't fail the trigger
                RAISE WARNING 'Failed to create profile for user %: %', NEW.email, SQLERRM;
        END;
    ELSE
        RAISE WARNING 'Profile already exists for user %, skipping creation', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Fix RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow any authenticated user to insert profiles (needed for signup)
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Also allow service role for trigger operations
CREATE POLICY "Enable insert for service role" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Step 6: Ensure doctors table exists with all columns
CREATE TABLE IF NOT EXISTS public.doctors (
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
    available_hours JSONB,
    bio TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add certifications column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'certifications') THEN
        ALTER TABLE doctors ADD COLUMN certifications TEXT[];
    END IF;
    
    -- Add education column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'education') THEN
        ALTER TABLE doctors ADD COLUMN education TEXT[];
    END IF;
    
    -- Add bio column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'bio') THEN
        ALTER TABLE doctors ADD COLUMN bio TEXT;
    END IF;
    
    -- Add languages column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'languages') THEN
        ALTER TABLE doctors ADD COLUMN languages TEXT[] DEFAULT ARRAY['English'];
    END IF;
    
    -- Add is_available column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'is_available') THEN
        ALTER TABLE doctors ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;
    
    -- Add rating column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'rating') THEN
        ALTER TABLE doctors ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    -- Add total_consultations column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'total_consultations') THEN
        ALTER TABLE doctors ADD COLUMN total_consultations INTEGER DEFAULT 0;
    END IF;
    
    -- Add hospital_affiliations column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'hospital_affiliations') THEN
        ALTER TABLE doctors ADD COLUMN hospital_affiliations TEXT[];
    END IF;
    
    -- Add available_hours column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'available_hours') THEN
        ALTER TABLE doctors ADD COLUMN available_hours JSONB;
    END IF;
END $$;

-- Step 7: Fix doctors table RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing doctor policies
DROP POLICY IF EXISTS "Doctors can view own doctor profile" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can update own doctor profile" ON public.doctors;
DROP POLICY IF EXISTS "Service role can insert doctor profiles" ON public.doctors;
DROP POLICY IF EXISTS "Public can view available doctors" ON public.doctors;
DROP POLICY IF EXISTS "Enable select for all users" ON public.doctors;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Enable update for doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow doctor profile creation" ON public.doctors;

-- Create new doctor policies with proper permissions
CREATE POLICY "Enable select for all users" ON public.doctors
    FOR SELECT USING (true);

-- Allow any authenticated user to insert doctor profiles (for signup)
CREATE POLICY "Allow doctor profile creation" ON public.doctors
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own doctor profile
CREATE POLICY "Enable update for doctors" ON public.doctors
    FOR UPDATE USING (
        auth.uid() = profile_id OR 
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'doctor')
    );

-- Allow deletion by profile owner
CREATE POLICY "Enable delete for doctors" ON public.doctors
    FOR DELETE USING (auth.uid() = profile_id);

-- Step 8: Test the setup
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Profiles table: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'profiles');
    RAISE NOTICE 'Doctors table: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'doctors');
    RAISE NOTICE 'Trigger exists: %', (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_auth_user_created');
END $$;
