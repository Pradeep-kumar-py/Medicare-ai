-- Ensure doctors table has all required columns
-- This migration adds any missing columns to the doctors table

-- Check if certifications column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'certifications') THEN
        ALTER TABLE doctors ADD COLUMN certifications TEXT[];
    END IF;
END $$;

-- Check if education column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'education') THEN
        ALTER TABLE doctors ADD COLUMN education TEXT[];
    END IF;
END $$;

-- Check if bio column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'bio') THEN
        ALTER TABLE doctors ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Check if languages column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'languages') THEN
        ALTER TABLE doctors ADD COLUMN languages TEXT[] DEFAULT ARRAY['English'];
    END IF;
END $$;

-- Check if hospital_affiliations column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'hospital_affiliations') THEN
        ALTER TABLE doctors ADD COLUMN hospital_affiliations TEXT[];
    END IF;
END $$;

-- Check if available_hours column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'available_hours') THEN
        ALTER TABLE doctors ADD COLUMN available_hours JSONB;
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
