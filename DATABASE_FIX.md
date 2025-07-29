# Database Setup for Doctor Authentication

## Quick Fix for Signup Error

The signup error occurs because the database trigger doesn't handle doctor roles properly. Run this SQL in your Supabase SQL Editor:

```sql
-- Fix the trigger to handle doctor role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Setup RLS Policies for Doctors

```sql
-- Enable RLS on doctors table
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Allow doctors to view their own doctor profile
CREATE POLICY "Doctors can view own doctor profile" ON public.doctors
  FOR SELECT USING (
    profile_id = auth.uid() AND 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
  );

-- Allow doctors to update their own doctor profile  
CREATE POLICY "Doctors can update own doctor profile" ON public.doctors
  FOR UPDATE USING (
    profile_id = auth.uid() AND 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
  );

-- Allow service role to insert doctor profiles
CREATE POLICY "Service role can insert doctor profiles" ON public.doctors
  FOR INSERT WITH CHECK (true);

-- Allow public to read available doctors (for appointment booking)
CREATE POLICY "Public can view available doctors" ON public.doctors
  FOR SELECT USING (is_available = true);
```

## Test the Fix

1. Run the SQL above in Supabase SQL Editor
2. Try signing up as a doctor again
3. Check the console for detailed logs

## Common Issues and Solutions

### Issue 1: "Database error saving new user"
- **Cause**: Trigger function failing
- **Solution**: Run the fixed trigger function above

### Issue 2: "Doctor profile creation failed"
- **Cause**: RLS policies blocking insert
- **Solution**: Run the RLS policies above

### Issue 3: Can't fetch doctors
- **Cause**: Missing view permissions
- **Solution**: Run the public view policy above

## Verify Setup

Check if everything is working:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'doctors');

-- Test data
SELECT d.*, p.full_name, p.email, p.role 
FROM doctors d 
JOIN profiles p ON d.profile_id = p.id;
```
