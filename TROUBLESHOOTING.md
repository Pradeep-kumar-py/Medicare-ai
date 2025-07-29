# Quick Fix for Doctor Profile Schema Error

## Issue
Error: "Could not find the 'certifications' column of 'doctors' in the schema cache"

## Immediate Solutions

### Option 1: Run Schema Fix (Recommended)
Run this SQL in your Supabase SQL Editor to ensure all columns exist:

```sql
-- Add missing columns if they don't exist
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS education TEXT[];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English'];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS hospital_affiliations TEXT[];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS available_hours JSONB;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

### Option 2: Check Current Schema
Verify what columns exist in your doctors table:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;
```

### Option 3: Restart Supabase Project
1. Go to your Supabase dashboard
2. Settings → General
3. Click "Restart project"
4. Wait for restart to complete

## What the Code Does Now

The updated signup code now:
1. ✅ Creates basic doctor profile with only required fields
2. ✅ Attempts to update with optional fields separately
3. ✅ Won't fail if optional fields don't exist
4. ✅ Provides detailed console logging

## Test Again

1. Run the SQL fix above
2. Try doctor signup again
3. Check console for detailed logs
4. Should see: "Doctor profile created successfully"

## Verify Setup

Check if doctor was created:

```sql
SELECT d.*, p.full_name, p.email, p.role 
FROM doctors d 
JOIN profiles p ON d.profile_id = p.id 
WHERE p.email = 'pk44011289@gmail.com';
```

The error should be resolved with either the SQL fix or the code will now handle missing columns gracefully.
