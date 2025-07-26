-- Add SQL functions for the healthcare app
CREATE OR REPLACE FUNCTION hospitals_within_radius(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  address TEXT,
  phone TEXT,
  hospital_type hospital_type,
  specialties TEXT[],
  rating DECIMAL,
  availability availability_type,
  has_emergency BOOLEAN,
  distance_km DOUBLE PRECISION
) LANGUAGE sql AS $$
  SELECT 
    h.id,
    h.name,
    h.address,
    h.phone,
    h.hospital_type,
    h.specialties,
    h.rating,
    h.availability,
    h.has_emergency,
    ST_Distance(h.coordinates, ST_GeogFromText('POINT(' || lng || ' ' || lat || ')')) / 1000 as distance_km
  FROM hospitals h
  WHERE ST_DWithin(
    h.coordinates,
    ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
    radius_km * 1000
  )
  ORDER BY distance_km;
$$;

-- Function to get upcoming medication reminders for a user
CREATE OR REPLACE FUNCTION get_upcoming_medication_reminders(
  user_uuid UUID,
  days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE(
  medication_id UUID,
  medication_name TEXT,
  dosage TEXT,
  next_reminder_time TIMESTAMPTZ,
  frequency TEXT
) LANGUAGE sql AS $$
  SELECT 
    m.id as medication_id,
    m.name as medication_name,
    m.dosage,
    (CURRENT_DATE + time_val)::TIMESTAMPTZ as next_reminder_time,
    m.frequency
  FROM medications m
  CROSS JOIN LATERAL unnest(m.schedule_times) as time_val
  WHERE m.user_id = user_uuid
    AND m.is_active = true
    AND m.reminder_enabled = true
    AND (CURRENT_DATE + time_val)::TIMESTAMPTZ >= NOW()
    AND (CURRENT_DATE + time_val)::TIMESTAMPTZ <= NOW() + (days_ahead || ' days')::INTERVAL
  ORDER BY next_reminder_time;
$$;

-- Function to get health metric trends for a user
CREATE OR REPLACE FUNCTION get_health_metric_trends(
  user_uuid UUID,
  metric_name_param TEXT,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  recorded_date DATE,
  avg_value DECIMAL,
  min_value DECIMAL,
  max_value DECIMAL,
  trend_direction TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH daily_metrics AS (
    SELECT 
      recorded_at::DATE as recorded_date,
      AVG(value) as avg_value,
      MIN(value) as min_value,
      MAX(value) as max_value
    FROM health_metrics
    WHERE user_id = user_uuid
      AND metric_name = metric_name_param
      AND recorded_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY recorded_at::DATE
    ORDER BY recorded_date
  ),
  with_lag AS (
    SELECT *,
      LAG(avg_value) OVER (ORDER BY recorded_date) as prev_value
    FROM daily_metrics
  )
  SELECT 
    recorded_date,
    avg_value,
    min_value,
    max_value,
    CASE 
      WHEN prev_value IS NULL THEN 'stable'
      WHEN avg_value > prev_value THEN 'up'
      WHEN avg_value < prev_value THEN 'down'
      ELSE 'stable'
    END as trend_direction
  FROM with_lag;
END;
$$;

-- Function to check for medication interactions
CREATE OR REPLACE FUNCTION check_medication_interactions(
  user_uuid UUID,
  new_medication_name TEXT
)
RETURNS TABLE(
  medication_name TEXT,
  interaction_type TEXT,
  severity TEXT,
  description TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  -- This is a simplified version - in production, you'd have a comprehensive drug interaction database
  RETURN QUERY
  SELECT 
    m.name as medication_name,
    'potential' as interaction_type,
    'medium' as severity,
    'Please consult with your doctor before taking ' || new_medication_name || ' with ' || m.name as description
  FROM medications m
  WHERE m.user_id = user_uuid
    AND m.is_active = true
    AND (
      (lower(m.name) LIKE '%warfarin%' AND lower(new_medication_name) LIKE '%aspirin%') OR
      (lower(m.name) LIKE '%aspirin%' AND lower(new_medication_name) LIKE '%warfarin%') OR
      (lower(m.name) LIKE '%metformin%' AND lower(new_medication_name) LIKE '%alcohol%')
    );
END;
$$;

-- Function to generate health insights for a user
CREATE OR REPLACE FUNCTION generate_health_insights(
  user_uuid UUID
)
RETURNS TABLE(
  insight_type TEXT,
  title TEXT,
  message TEXT,
  priority TEXT,
  action_needed BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
  recent_metrics_count INTEGER;
  overdue_medications_count INTEGER;
  upcoming_appointments_count INTEGER;
BEGIN
  -- Count recent health metrics
  SELECT COUNT(*) INTO recent_metrics_count
  FROM health_metrics
  WHERE user_id = user_uuid
    AND recorded_at >= (NOW() - INTERVAL '7 days');
  
  -- Count overdue medications (simplified logic)
  SELECT COUNT(*) INTO overdue_medications_count
  FROM medications m
  WHERE m.user_id = user_uuid
    AND m.is_active = true
    AND m.end_date < CURRENT_DATE;
  
  -- Count upcoming appointments
  SELECT COUNT(*) INTO upcoming_appointments_count
  FROM appointments a
  WHERE a.patient_id = user_uuid
    AND a.appointment_date >= CURRENT_DATE
    AND a.appointment_date <= (CURRENT_DATE + INTERVAL '7 days')
    AND a.status = 'scheduled';

  -- Generate insights based on data
  IF recent_metrics_count = 0 THEN
    RETURN QUERY SELECT 
      'health_tracking'::TEXT,
      'Start Health Tracking'::TEXT,
      'You haven''t recorded any health metrics recently. Regular tracking helps monitor your wellness.'::TEXT,
      'medium'::TEXT,
      true;
  END IF;

  IF overdue_medications_count > 0 THEN
    RETURN QUERY SELECT 
      'medication'::TEXT,
      'Medication Review Needed'::TEXT,
      format('You have %s medications that may need review. Please consult your doctor.', overdue_medications_count)::TEXT,
      'high'::TEXT,
      true;
  END IF;

  IF upcoming_appointments_count > 0 THEN
    RETURN QUERY SELECT 
      'appointment'::TEXT,
      'Upcoming Appointments'::TEXT,
      format('You have %s appointments scheduled this week. Don''t forget to attend them.', upcoming_appointments_count)::TEXT,
      'low'::TEXT,
      false;
  END IF;

  -- If no specific insights, provide general wellness tip
  IF recent_metrics_count > 0 AND overdue_medications_count = 0 THEN
    RETURN QUERY SELECT 
      'wellness'::TEXT,
      'Great Job!'::TEXT,
      'You''re doing well with your health tracking. Keep up the good work!'::TEXT,
      'low'::TEXT,
      false;
  END IF;
END;
$$;
