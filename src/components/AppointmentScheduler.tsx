import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, User, MapPin, CheckCircle, Video, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from '../hooks/use-toast';
import { appointmentService, doctorService } from '../integrations/supabase/services';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  image: string;
  nextAvailable: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const AppointmentScheduler: React.FC = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'teleconsultation'>('in-person');
  const [step, setStep] = useState<'doctor' | 'datetime' | 'confirm'>('doctor');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Log any potential errors for debugging
    const handleError = (event: ErrorEvent) => {
      console.error('AppointmentScheduler error:', event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch doctors from database...');
      
      const dbDoctors = await doctorService.getDoctors();
      console.log('Raw doctors data from database:', dbDoctors);
      
      // Transform database doctors to match our interface
      const transformedDoctors: Doctor[] = dbDoctors.map((doctor, index) => ({
        id: doctor.id,
        name: doctor.profile?.full_name || `Dr. ${doctor.specialization} Specialist`,
        specialization: doctor.specialization,
        rating: doctor.rating || 4.5,
        experience: doctor.experience_years ? `${doctor.experience_years} years` : '5+ years',
        image: index % 2 === 0 ? '👩‍⚕️' : '👨‍⚕️',
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      // Add some demo doctors for better experience
      const mockDoctors: Doctor[] = [
        {
          id: 'mock-1',
          name: 'Dr. Sarah Johnson',
          specialization: 'General Physician',
          rating: 4.8,
          experience: '12 years',
          image: '👩‍⚕️',
          nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'mock-2',
          name: 'Dr. Michael Chen',
          specialization: 'Cardiologist',
          rating: 4.9,
          experience: '15 years',
          image: '👨‍⚕️',
          nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'mock-3',
          name: 'Dr. Emily Rodriguez',
          specialization: 'Dermatologist',
          rating: 4.7,
          experience: '8 years',
          image: '👩‍⚕️',
          nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];

      // Combine real and demo doctors
      const allDoctors = [...transformedDoctors, ...mockDoctors];
      setDoctors(allDoctors);
      console.log('Total doctors available:', allDoctors.length, 'Real:', transformedDoctors.length, 'Demo:', mockDoctors.length);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to demo data
      const fallbackDoctors: Doctor[] = [
        {
          id: 'fallback-1',
          name: 'Dr. Emergency Physician',
          specialization: 'General Practice',
          rating: 4.5,
          experience: '10 years',
          image: '👩‍⚕️',
          nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      setDoctors(fallbackDoctors);
    } finally {
      setLoading(false);
    }
  };

  // Generate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // Generate time slots
  const getTimeSlots = (): TimeSlot[] => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        // Randomly make some slots unavailable for demo
        const available = Math.random() > 0.3;
        slots.push({ time, available });
      }
    }
    return slots;
  };

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('datetime');
  };

  const confirmAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Incomplete Information",
        description: "Please select all required fields to book the appointment.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setBookingLoading(true);

      // Check if it's a mock doctor or real doctor
      if (selectedDoctor.id.startsWith('mock-') || selectedDoctor.id.startsWith('fallback-')) {
        toast({
          title: "Demo Appointment Booked!",
          description: `Your demo appointment with ${selectedDoctor.name} is confirmed for ${selectedDate} at ${selectedTime}. This is a demonstration booking.`,
        });
      } else {
        // Book with real doctor
        const appointmentData = {
          patient_id: user.id,
          doctor_id: selectedDoctor.id,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          appointment_type: appointmentType === 'teleconsultation' ? 'teleconsultation' : 'consultation',
          reason: 'General consultation',
          status: 'scheduled' as const
        };

        await appointmentService.createAppointment(appointmentData);
        
        toast({
          title: "Appointment Confirmed!",
          description: `Your ${appointmentType === 'teleconsultation' ? 'teleconsultation' : 'appointment'} with ${selectedDoctor.name} is confirmed for ${selectedDate} at ${selectedTime}.`,
        });
      }
      
      // Reset form
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setStep('doctor');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to book the appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <User className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Login Required</h2>
              <p className="text-muted-foreground">
                Please log in to book an appointment with our doctors.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Login / Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <Calendar className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold">{t('appointmentTitle')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Schedule appointments with top healthcare professionals in your area.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {['doctor', 'datetime', 'confirm'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === stepName || (['datetime', 'confirm'].includes(step) && index < 2) || (step === 'confirm' && index < 3)
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }`}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`w-20 h-1 mx-2 rounded
                  ${(['datetime', 'confirm'].includes(step) && index < 1) || (step === 'confirm' && index < 2)
                    ? 'bg-primary' 
                    : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 'doctor' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Choose Your Doctor</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading doctors...</span>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="medical-card cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => selectDoctor(doctor)}>
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{doctor.image}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {doctor.name}
                          {doctor.id.startsWith('mock-') || doctor.id.startsWith('fallback-') ? (
                            <Badge variant="secondary" className="text-xs">Demo</Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">Available</Badge>
                          )}
                        </CardTitle>
                        <p className="text-muted-foreground">{doctor.specialization}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(doctor.rating)}
                            <span className="text-sm text-muted-foreground ml-1">{doctor.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{doctor.experience}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Available from {formatDate(doctor.nextAvailable)}</span>
                      </div>
                      <Button size="sm">Select</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 'datetime' && selectedDoctor && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Select Date & Time</h2>
            <p className="text-muted-foreground">Booking with {selectedDoctor.name}</p>
          </div>

          {/* Appointment Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={appointmentType === 'in-person' ? "default" : "outline"}
                  onClick={() => setAppointmentType('in-person')}
                  className="h-auto py-4 flex-col"
                >
                  <MapPin className="h-6 w-6 mb-2" />
                  <span className="font-medium">In-Person Visit</span>
                  <span className="text-xs opacity-70">Visit doctor's clinic</span>
                </Button>
                <Button
                  variant={appointmentType === 'teleconsultation' ? "default" : "outline"}
                  onClick={() => setAppointmentType('teleconsultation')}
                  className="h-auto py-4 flex-col"
                >
                  <Video className="h-6 w-6 mb-2" />
                  <span className="font-medium">Teleconsultation</span>
                  <span className="text-xs opacity-70">Video call with doctor</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Select Date</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {getAvailableDates().map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      onClick={() => setSelectedDate(date)}
                      className="h-auto py-3 flex-col"
                    >
                      <span className="font-medium">{formatDate(date)}</span>
                      <span className="text-xs opacity-70">{date}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Select Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {getTimeSlots().map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      size="sm"
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('doctor')}>
              Back
            </Button>
            <Button 
              onClick={() => setStep('confirm')}
              disabled={!selectedDate || !selectedTime}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirm' && selectedDoctor && selectedDate && selectedTime && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Confirm Appointment</h2>
            <p className="text-muted-foreground">Review your appointment details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Appointment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl">{selectedDoctor.image}</div>
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {selectedDoctor.name}
                    {selectedDoctor.id.startsWith('mock-') || selectedDoctor.id.startsWith('fallback-') ? (
                      <Badge variant="secondary" className="text-xs">Demo</Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">Real Doctor</Badge>
                    )}
                  </h4>
                  <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(selectedDoctor.rating)}
                    <span className="text-sm text-muted-foreground ml-1">{selectedDoctor.rating} • {selectedDoctor.experience}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Appointment Type</label>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  {appointmentType === 'teleconsultation' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  <span>{appointmentType === 'teleconsultation' ? 'Teleconsultation (Video Call)' : 'In-Person Visit'}</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Appointment Notes</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Please arrive 15 minutes early for check-in</li>
                  <li>• Bring a valid ID and insurance card</li>
                  <li>• You'll receive a confirmation email shortly</li>
                  {selectedDoctor.id.startsWith('mock-') || selectedDoctor.id.startsWith('fallback-') ? (
                    <li>• This is a demonstration booking for testing purposes</li>
                  ) : null}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('datetime')}>
              Back
            </Button>
            <Button 
              onClick={confirmAppointment} 
              className="bg-gradient-primary"
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;