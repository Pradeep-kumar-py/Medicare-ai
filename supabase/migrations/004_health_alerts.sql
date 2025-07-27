-- Create health_alerts table
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('personal', 'community', 'environmental', 'epidemic', 'weather', 'medication', 'appointment')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  display_timestamp VARCHAR(100),
  location VARCHAR(255),
  affected_population INTEGER,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  related_medication VARCHAR(255),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for health_alerts
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own alerts
CREATE POLICY "Users can view their own health alerts"
  ON public.health_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to update their own alerts (mark as read, dismiss)
CREATE POLICY "Users can update their own health alerts"
  ON public.health_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow system to insert alerts for any user
CREATE POLICY "System can insert health alerts"
  ON public.health_alerts
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS health_alerts_user_id_idx ON public.health_alerts (user_id);
CREATE INDEX IF NOT EXISTS health_alerts_type_idx ON public.health_alerts (type);
CREATE INDEX IF NOT EXISTS health_alerts_is_read_idx ON public.health_alerts (is_read);
CREATE INDEX IF NOT EXISTS health_alerts_is_dismissed_idx ON public.health_alerts (is_dismissed);

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_alerts_updated_at
BEFORE UPDATE ON public.health_alerts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Sample seed data
INSERT INTO public.health_alerts (
  user_id,
  type,
  severity,
  title,
  description,
  recommendation,
  display_timestamp,
  location,
  affected_population,
  is_read,
  is_dismissed
) VALUES (
  -- This would need to be updated with actual user IDs
  (SELECT id FROM public.profiles LIMIT 1),
  'personal',
  'medium',
  'Blood Pressure Alert',
  'Your recent blood pressure readings show an upward trend. Consider lifestyle adjustments.',
  'Schedule a consultation with your cardiologist and monitor daily readings.',
  '2 hours ago',
  NULL,
  NULL,
  false,
  false
);

-- Function to create community health alerts
CREATE OR REPLACE FUNCTION public.create_community_health_alert(
  alert_type VARCHAR,
  alert_severity VARCHAR,
  alert_title VARCHAR,
  alert_description TEXT,
  alert_recommendation TEXT,
  alert_location VARCHAR DEFAULT NULL,
  alert_affected_population INTEGER DEFAULT NULL
) RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles LOOP
    INSERT INTO public.health_alerts (
      user_id,
      type,
      severity,
      title,
      description,
      recommendation,
      display_timestamp,
      location,
      affected_population,
      is_read,
      is_dismissed
    ) VALUES (
      user_record.id,
      alert_type,
      alert_severity,
      alert_title,
      alert_description,
      alert_recommendation,
      'Just now',
      alert_location,
      alert_affected_population,
      false,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
