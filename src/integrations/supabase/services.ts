import { supabase } from './client';
import type { Database } from './types';

type Tables = Database['public']['Tables'];

// Profile functions
export const profileService = {
  async getCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          try {
            const newProfile = await this.createProfile(user);
            return newProfile;
          } catch (createError) {
            console.error('Error creating profile:', createError);
            // Return a minimal profile object if creation fails
            return {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || 'New User',
              role: 'patient' as const,
              avatar_url: user.user_metadata?.avatar_url || null,
              preferred_language: 'en',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
        }
        console.error('Profile fetch error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async createProfile(user: any) {
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'New User',
      role: 'patient' as const,
      avatar_url: user.user_metadata?.avatar_url || null,
      preferred_language: 'en',
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createDefaultProfile(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const defaultProfile = {
      id: userId,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      role: 'patient' as const,
      avatar_url: null,
      phone: null,
      date_of_birth: null,
      gender: null,
      address: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      medical_history: null,
      allergies: null,
      current_medications: null,
      insurance_provider: null,
      insurance_policy_number: null,
      preferred_language: null,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(updates: Partial<Tables['profiles']['Update']>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Appointments functions
export const appointmentService = {
  async getAppointments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors!inner(
          *,
          profile:profiles!inner(*)
        ),
        hospital:hospitals(*)
      `)
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createAppointment(appointment: Tables['appointments']['Insert']) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const appointmentData = {
      ...appointment,
      patient_id: user.id
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAppointment(id: string, updates: Tables['appointments']['Update']) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Doctors functions
export const doctorService = {
  async getDoctors(specialization?: string) {
    let query = supabase
      .from('doctors')
      .select(`
        *,
        profile:profiles!inner(*)
      `)
      .eq('is_available', true);

    if (specialization) {
      query = query.eq('specialization', specialization);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDoctorById(id: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        profile:profiles!inner(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// Health metrics functions
export const healthMetricsService = {
  async getHealthMetrics(limit = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async addHealthMetric(metric: Omit<Tables['health_metrics']['Insert'], 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('health_metrics')
      .insert({
        ...metric,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLatestMetricByName(metricName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('metric_name', metricName)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  }
};

// Medications functions
export const medicationService = {
  async getMedications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medications')
      .select(`
        *,
        prescribed_by:doctors(
          *,
          profile:profiles!inner(*)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addMedication(medication: Omit<Tables['medications']['Insert'], 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medications')
      .insert({
        ...medication,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMedication(id: string, updates: Tables['medications']['Update']) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async logMedicationTaken(medicationId: string, takenAt?: Date) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('medication_logs')
      .insert({
        medication_id: medicationId,
        user_id: user.id,
        scheduled_time: takenAt ? takenAt.toISOString() : new Date().toISOString(),
        taken_at: new Date().toISOString(),
        was_taken: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Symptoms functions
export const symptomService = {
  async getSymptoms() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', user.id)
      .order('reported_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addSymptom(symptom: Omit<Tables['symptoms']['Insert'], 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('symptoms')
      .insert({
        ...symptom,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Teleconsultations functions
export const teleconsultationService = {
  async getTeleconsultations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('teleconsultations')
      .select(`
        *,
        appointment:appointments!inner(*),
        doctor:doctors!inner(
          *,
          profile:profiles!inner(*)
        )
      `)
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTeleconsultation(consultation: Tables['teleconsultations']['Insert']) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const consultationData = {
      ...consultation,
      patient_id: user.id
    };

    const { data, error } = await supabase
      .from('teleconsultations')
      .insert(consultationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Hospitals functions
export const hospitalService = {
  async getHospitals() {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getNearbyHospitals(latitude: number, longitude: number, radiusKm = 50) {
    // Since the RPC function doesn't exist, we'll return all hospitals for now
    // TODO: Implement proper geospatial filtering when the RPC function is created
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Medicines functions
export const medicineService = {
  async getMedicines(category?: string, searchTerm?: string) {
    let query = supabase
      .from('medicines')
      .select('*')
      .eq('in_stock', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Health trends functions
export const healthTrendsService = {
  async getHealthTrends(category?: string) {
    let query = supabase
      .from('health_trends')
      .select('*');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('date_recorded', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// User alerts functions
export const alertService = {
  async getAlerts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAlertAsRead(id: string) {
    const { data, error } = await supabase
      .from('user_alerts')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Insurance functions
export const insuranceService = {
  async getInsuranceProviders() {
    const { data, error } = await supabase
      .from('insurance_providers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getInsuranceClaims() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('insurance_claims')
      .select(`
        *,
        provider:insurance_providers(*)
      `)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createInsuranceClaim(claim: Omit<Tables['insurance_claims']['Insert'], 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert({
        ...claim,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Authentication functions
export const authService = {
  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};
