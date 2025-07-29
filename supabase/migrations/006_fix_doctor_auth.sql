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

-- Also update the doctors table policies
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

-- Update appointments table policies for doctors
CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
  );
