export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          hospital_id: string | null
          appointment_date: string
          appointment_time: string
          duration_minutes: number | null
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          appointment_type: string | null
          reason: string | null
          symptoms: string | null
          notes: string | null
          prescription: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          hospital_id?: string | null
          appointment_date: string
          appointment_time: string
          duration_minutes?: number | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          appointment_type?: string | null
          reason?: string | null
          symptoms?: string | null
          notes?: string | null
          prescription?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          hospital_id?: string | null
          appointment_date?: string
          appointment_time?: string
          duration_minutes?: number | null
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          appointment_type?: string | null
          reason?: string | null
          symptoms?: string | null
          notes?: string | null
          prescription?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      consultation_messages: {
        Row: {
          id: string
          consultation_id: string
          sender_id: string
          message_type: string | null
          content: string
          file_url: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          consultation_id: string
          sender_id: string
          message_type?: string | null
          content: string
          file_url?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          consultation_id?: string
          sender_id?: string
          message_type?: string | null
          content?: string
          file_url?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "teleconsultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      doctors: {
        Row: {
          id: string
          profile_id: string | null
          specialization: string
          license_number: string
          experience_years: number | null
          consultation_fee: number | null
          rating: number | null
          total_consultations: number | null
          languages: string[] | null
          education: string[] | null
          certifications: string[] | null
          hospital_affiliations: string[] | null
          available_hours: Json | null
          bio: string | null
          is_available: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          specialization: string
          license_number: string
          experience_years?: number | null
          consultation_fee?: number | null
          rating?: number | null
          total_consultations?: number | null
          languages?: string[] | null
          education?: string[] | null
          certifications?: string[] | null
          hospital_affiliations?: string[] | null
          available_hours?: Json | null
          bio?: string | null
          is_available?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          specialization?: string
          license_number?: string
          experience_years?: number | null
          consultation_fee?: number | null
          rating?: number | null
          total_consultations?: number | null
          languages?: string[] | null
          education?: string[] | null
          certifications?: string[] | null
          hospital_affiliations?: string[] | null
          available_hours?: Json | null
          bio?: string | null
          is_available?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      health_metrics: {
        Row: {
          id: string
          user_id: string
          metric_name: string
          value: number
          unit: string
          status: 'normal' | 'warning' | 'critical' | null
          trend: 'up' | 'down' | 'stable' | null
          recorded_at: string
          device_source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_name: string
          value: number
          unit: string
          status?: 'normal' | 'warning' | 'critical' | null
          trend?: 'up' | 'down' | 'stable' | null
          recorded_at?: string
          device_source?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_name?: string
          value?: number
          unit?: string
          status?: 'normal' | 'warning' | 'critical' | null
          trend?: 'up' | 'down' | 'stable' | null
          recorded_at?: string
          device_source?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      health_trends: {
        Row: {
          id: string
          trend_name: string
          category: string
          current_value: number
          previous_value: number | null
          unit: string
          trend: 'up' | 'down' | 'stable' | null
          severity: 'low' | 'medium' | 'high' | null
          location: string | null
          population_affected: number | null
          description: string | null
          date_recorded: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trend_name: string
          category: string
          current_value: number
          previous_value?: number | null
          unit: string
          trend?: 'up' | 'down' | 'stable' | null
          severity?: 'low' | 'medium' | 'high' | null
          location?: string | null
          population_affected?: number | null
          description?: string | null
          date_recorded?: string | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trend_name?: string
          category?: string
          current_value?: number
          previous_value?: number | null
          unit?: string
          trend?: 'up' | 'down' | 'stable' | null
          severity?: 'low' | 'medium' | 'high' | null
          location?: string | null
          population_affected?: number | null
          description?: string | null
          date_recorded?: string | null
          source?: string | null
          created_at?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          id: string
          name: string
          address: string
          phone: string | null
          email: string | null
          website: string | null
          hospital_type: 'government' | 'private'
          specialties: string[] | null
          rating: number | null
          availability: '24/7' | 'day_only' | null
          has_emergency: boolean | null
          coordinates: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone?: string | null
          email?: string | null
          website?: string | null
          hospital_type: 'government' | 'private'
          specialties?: string[] | null
          rating?: number | null
          availability?: '24/7' | 'day_only' | null
          has_emergency?: boolean | null
          coordinates?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          hospital_type?: 'government' | 'private'
          specialties?: string[] | null
          rating?: number | null
          availability?: '24/7' | 'day_only' | null
          has_emergency?: boolean | null
          coordinates?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          id: string
          user_id: string
          provider_id: string | null
          claim_number: string
          treatment_date: string
          hospital_name: string
          treatment_type: string
          claim_amount: number
          approved_amount: number | null
          status: string | null
          documents: string[] | null
          submitted_at: string
          processed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider_id?: string | null
          claim_number: string
          treatment_date: string
          hospital_name: string
          treatment_type: string
          claim_amount: number
          approved_amount?: number | null
          status?: string | null
          documents?: string[] | null
          submitted_at?: string
          processed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider_id?: string | null
          claim_number?: string
          treatment_date?: string
          hospital_name?: string
          treatment_type?: string
          claim_amount?: number
          approved_amount?: number | null
          status?: string | null
          documents?: string[] | null
          submitted_at?: string
          processed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "insurance_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      insurance_providers: {
        Row: {
          id: string
          name: string
          website: string | null
          phone: string | null
          email: string | null
          coverage_areas: string[] | null
          plan_types: string[] | null
          network_hospitals: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          phone?: string | null
          email?: string | null
          coverage_areas?: string[] | null
          plan_types?: string[] | null
          network_hospitals?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          phone?: string | null
          email?: string | null
          coverage_areas?: string[] | null
          plan_types?: string[] | null
          network_hospitals?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          user_id: string
          scheduled_time: string
          taken_at: string | null
          was_taken: boolean | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          medication_id: string
          user_id: string
          scheduled_time: string
          taken_at?: string | null
          was_taken?: boolean | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          medication_id?: string
          user_id?: string
          scheduled_time?: string
          taken_at?: string | null
          was_taken?: boolean | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          schedule_times: string[] | null
          start_date: string
          end_date: string | null
          instructions: string | null
          side_effects: string[] | null
          prescribed_by: string | null
          is_active: boolean | null
          reminder_enabled: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          schedule_times?: string[] | null
          start_date: string
          end_date?: string | null
          instructions?: string | null
          side_effects?: string[] | null
          prescribed_by?: string | null
          is_active?: boolean | null
          reminder_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string
          frequency?: string
          schedule_times?: string[] | null
          start_date?: string
          end_date?: string | null
          instructions?: string | null
          side_effects?: string[] | null
          prescribed_by?: string | null
          is_active?: boolean | null
          reminder_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      medicines: {
        Row: {
          id: string
          name: string
          generic_name: string | null
          brand_name: string | null
          category: string
          description: string | null
          price: number | null
          manufacturer: string | null
          requires_prescription: boolean | null
          side_effects: string[] | null
          contraindications: string[] | null
          dosage_forms: string[] | null
          storage_instructions: string | null
          active_ingredients: string[] | null
          in_stock: boolean | null
          pharmacy_store: string | null
          store_url: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          generic_name?: string | null
          brand_name?: string | null
          category: string
          description?: string | null
          price?: number | null
          manufacturer?: string | null
          requires_prescription?: boolean | null
          side_effects?: string[] | null
          contraindications?: string[] | null
          dosage_forms?: string[] | null
          storage_instructions?: string | null
          active_ingredients?: string[] | null
          in_stock?: boolean | null
          pharmacy_store?: string | null
          store_url?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          generic_name?: string | null
          brand_name?: string | null
          category?: string
          description?: string | null
          price?: number | null
          manufacturer?: string | null
          requires_prescription?: boolean | null
          side_effects?: string[] | null
          contraindications?: string[] | null
          dosage_forms?: string[] | null
          storage_instructions?: string | null
          active_ingredients?: string[] | null
          in_stock?: boolean | null
          pharmacy_store?: string | null
          store_url?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'patient' | 'doctor' | 'admin' | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: string[] | null
          allergies: string[] | null
          current_medications: string[] | null
          insurance_provider: string | null
          insurance_policy_number: string | null
          preferred_language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'doctor' | 'admin' | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string[] | null
          allergies?: string[] | null
          current_medications?: string[] | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          preferred_language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'doctor' | 'admin' | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string[] | null
          allergies?: string[] | null
          current_medications?: string[] | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          preferred_language?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      symptoms: {
        Row: {
          id: string
          user_id: string
          description: string
          severity: 'low' | 'medium' | 'high' | null
          body_parts: string[] | null
          duration: string | null
          triggers: string[] | null
          analysis_result: Json | null
          suggested_conditions: string[] | null
          recommended_actions: string[] | null
          urgency: 'routine' | 'soon' | 'urgent' | null
          reported_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          severity?: 'low' | 'medium' | 'high' | null
          body_parts?: string[] | null
          duration?: string | null
          triggers?: string[] | null
          analysis_result?: Json | null
          suggested_conditions?: string[] | null
          recommended_actions?: string[] | null
          urgency?: 'routine' | 'soon' | 'urgent' | null
          reported_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          severity?: 'low' | 'medium' | 'high' | null
          body_parts?: string[] | null
          duration?: string | null
          triggers?: string[] | null
          analysis_result?: Json | null
          suggested_conditions?: string[] | null
          recommended_actions?: string[] | null
          urgency?: 'routine' | 'soon' | 'urgent' | null
          reported_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      teleconsultations: {
        Row: {
          id: string
          appointment_id: string | null
          patient_id: string
          doctor_id: string
          session_url: string | null
          status: 'pending' | 'active' | 'completed' | 'cancelled' | null
          started_at: string | null
          ended_at: string | null
          duration_minutes: number | null
          recording_url: string | null
          prescription: string | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id?: string | null
          patient_id: string
          doctor_id: string
          session_url?: string | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled' | null
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number | null
          recording_url?: string | null
          prescription?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string | null
          patient_id?: string
          doctor_id?: string
          session_url?: string | null
          status?: 'pending' | 'active' | 'completed' | 'cancelled' | null
          started_at?: string | null
          ended_at?: string | null
          duration_minutes?: number | null
          recording_url?: string | null
          prescription?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teleconsultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleconsultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string
          alert_type: string
          title: string
          message: string
          severity: 'low' | 'medium' | 'high' | null
          is_read: boolean | null
          action_url: string | null
          scheduled_for: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: string
          title: string
          message: string
          severity?: 'low' | 'medium' | 'high' | null
          is_read?: boolean | null
          action_url?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: string
          title?: string
          message?: string
          severity?: 'low' | 'medium' | 'high' | null
          is_read?: boolean | null
          action_url?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_type: '24/7' | 'day_only'
      appointment_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
      consultation_status: 'pending' | 'active' | 'completed' | 'cancelled'
      health_metric_status: 'normal' | 'warning' | 'critical'
      hospital_type: 'government' | 'private'
      severity_level: 'low' | 'medium' | 'high'
      trend_type: 'up' | 'down' | 'stable'
      urgency_level: 'routine' | 'soon' | 'urgent'
      user_role: 'patient' | 'doctor' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
