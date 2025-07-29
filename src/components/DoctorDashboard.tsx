import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Video, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Bell,
  Activity
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  symptoms?: string;
  consultation_type: 'video' | 'phone' | 'in-person';
}

interface DoctorProfile {
  id: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  total_consultations: number;
  is_available: boolean;
  bio: string;
}

const DoctorDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [totalCalls, setTotalCalls] = useState(0);
  const [todayCalls, setTodayCalls] = useState(0);

  useEffect(() => {
    if (user && profile?.role === 'doctor') {
      fetchDoctorData();
      setupRealtimeSubscription();
    }
  }, [user, profile]);

  useEffect(() => {
    // Refresh data every 30 seconds to catch new appointments
    const interval = setInterval(() => {
      if (user && profile?.role === 'doctor') {
        fetchDoctorData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, profile]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor profile
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('profile_id', user?.id)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor profile:', doctorError);
        return;
      }

      setDoctorProfile(doctorData);
      setIsOnline(doctorData.is_available);

      // Fetch appointments with better error handling
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(full_name, email)
        `)
        .eq('doctor_id', doctorData.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        // Don't throw error, just log it and continue with empty appointments
        setAppointments([]);
      } else {
        const formattedAppointments = (appointmentData || []).map(apt => ({
          id: apt.id,
          patient_name: apt.patient?.full_name || 'Unknown Patient',
          patient_email: apt.patient?.email || '',
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          status: apt.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
          reason: apt.reason || '',
          symptoms: apt.symptoms || '',
          consultation_type: (apt.appointment_type === 'teleconsultation' ? 'video' : 'in-person') as 'video' | 'phone' | 'in-person'
        }));

        setAppointments(formattedAppointments);
        console.log(`Loaded ${formattedAppointments.length} appointments for doctor`);
      }

      // Fetch teleconsultation data (call counts)
      const { data: teleconsultationData, error: teleconsultationError } = await supabase
        .from('teleconsultations')
        .select('id, started_at, status')
        .eq('doctor_id', doctorData.id);

      if (teleconsultationError) {
        console.error('Error fetching teleconsultation data:', teleconsultationError);
      } else {
        // Count total calls (completed or active)
        const completedCalls = teleconsultationData.filter(call => 
          call.status === 'completed' || call.status === 'active'
        ).length;
        setTotalCalls(completedCalls);

        // Count today's calls
        const today = new Date().toISOString().split('T')[0];
        const todaysCompletedCalls = teleconsultationData.filter(call => 
          (call.status === 'completed' || call.status === 'active') &&
          call.started_at && call.started_at.startsWith(today)
        ).length;
        setTodayCalls(todaysCompletedCalls);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!doctorProfile) return;

    // Subscribe to new appointments
    const appointmentSubscription = supabase
      .channel('doctor-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorProfile.id}`
        },
        (payload) => {
          console.log('New appointment update:', payload);
          fetchDoctorData(); // Refresh data
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Appointment!",
              description: "You have a new appointment booking. Check your dashboard for details.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Appointment Updated",
              description: "An appointment has been updated.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      appointmentSubscription.unsubscribe();
    };
  };

  const toggleAvailability = async () => {
    if (!doctorProfile) return;

    try {
      const newStatus = !isOnline;
      const { error } = await supabase
        .from('doctors')
        .update({ is_available: newStatus })
        .eq('id', doctorProfile.id);

      if (error) throw error;

      setIsOnline(newStatus);
      setDoctorProfile({ ...doctorProfile, is_available: newStatus });
      
      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus 
          ? "Patients can now book appointments with you" 
          : "New appointment bookings are paused",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive"
      });
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      const statusMap: Record<string, 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'> = {
        confirm: 'confirmed',
        cancel: 'cancelled',
        complete: 'completed'
      };

      const { error } = await supabase
        .from('appointments')
        .update({ status: statusMap[action] })
        .eq('id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: statusMap[action] }
          : apt
      ));

      toast({
        title: "Appointment Updated",
        description: `Appointment ${action}ed successfully`,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  const startTeleconsultation = (appointmentId: string, patientEmail: string) => {
    // Navigate to teleconsultation with appointment context
    const teleconsultationUrl = `/teleconsultation?room=${appointmentId}&doctor=true&patient=${encodeURIComponent(patientEmail)}`;
    window.open(teleconsultationUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <Activity className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-warning mx-auto" />
              <h2 className="text-xl font-semibold">Doctor Profile Not Found</h2>
              <p className="text-muted-foreground">
                Your doctor profile is not set up yet. Please contact support to complete your doctor registration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Dr. {profile?.full_name}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Available</span>
            <Switch
              checked={isOnline}
              onCheckedChange={toggleAvailability}
            />
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => apt.appointment_date === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCalls}</div>
            <p className="text-xs text-muted-foreground">Video consultations today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">All-time consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorProfile.total_consultations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorProfile.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments ({appointments.length})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDoctorData}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
              <p className="text-muted-foreground mb-4">
                Patients can book appointments with you through the appointment scheduler.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>✅ Your profile is {doctorProfile.is_available ? 'available' : 'not available'} for bookings</p>
                <p>📝 Make sure your availability status is turned on to receive bookings</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {appointment.patient_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{appointment.patient_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {appointment.consultation_type === 'video' ? 'Video' : 'In-Person'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.patient_email}</p>
                      <p className="text-sm text-muted-foreground">
                        📅 {new Date(appointment.appointment_date).toLocaleDateString()} at ⏰ {appointment.appointment_time}
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-muted-foreground">💬 Reason: {appointment.reason}</p>
                      )}
                      {appointment.symptoms && (
                        <p className="text-sm text-muted-foreground">🩺 Symptoms: {appointment.symptoms}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">{appointment.status}</span>
                    </Badge>

                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                      >
                        Confirm
                      </Button>
                    )}

                    {appointment.status === 'confirmed' && appointment.consultation_type === 'video' && (
                      <Button
                        size="sm"
                        onClick={() => startTeleconsultation(appointment.id, appointment.patient_email)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Start Call
                      </Button>
                    )}

                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                      >
                        Complete
                      </Button>
                    )}

                    {['scheduled', 'confirmed'].includes(appointment.status) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
