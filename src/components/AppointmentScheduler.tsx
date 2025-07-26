import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Clock, User, MapPin, CheckCircle } from 'lucide-react';
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [step, setStep] = useState<'doctor' | 'datetime' | 'confirm'>('doctor');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const dbDoctors = await doctorService.getDoctors();
      
      // Transform database doctors to match our interface
      const transformedDoctors: Doctor[] = dbDoctors.map((doctor, index) => ({
        id: doctor.id,
        name: doctor.profile?.full_name || `Dr. ${doctor.specialization} Specialist`,
        specialization: doctor.specialization,
        rating: doctor.rating || 4.5,
        experience: doctor.experience_years ? `${doctor.experience_years} years` : '5+ years',
        image: index % 2 === 0 ? '👩‍⚕️' : '👨‍⚕️',
        nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
      }));

      // If no doctors in database, use mock data
      if (transformedDoctors.length === 0) {
        const mockDoctors: Doctor[] = [
          {
            id: 'mock-1',
            name: 'Dr. Sarah Johnson',
            specialization: 'General Physician',
            rating: 4.8,
            experience: '12 years',
            image: '👩‍⚕️',
            nextAvailable: '2024-01-15'
          },
          {
            id: 'mock-2',
            name: 'Dr. Michael Chen',
            specialization: 'Cardiologist',
            rating: 4.9,
            experience: '15 years',
            image: '👨‍⚕️',
            nextAvailable: '2024-01-16'
          },
          {
            id: 'mock-3',
            name: 'Dr. Emily Rodriguez',
            specialization: 'Dermatologist',
            rating: 4.7,
            experience: '8 years',
            image: '👩‍⚕️',
            nextAvailable: '2024-01-15'
          },
          {
            id: 'mock-4',
            name: 'Dr. James Wilson',
            specialization: 'Pediatrician',
            rating: 4.9,
            experience: '20 years',
            image: '👨‍⚕️',
            nextAvailable: '2024-01-17'
          }
        ];
        setDoctors(mockDoctors);
      } else {
        setDoctors(transformedDoctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock doctors data
  const mockDoctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'General Physician',
      rating: 4.8,
      experience: '12 years',
      image: '👩‍⚕️',
      nextAvailable: '2024-01-15'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Cardiologist',
      rating: 4.9,
      experience: '15 years',
      image: '👨‍⚕️',
      nextAvailable: '2024-01-16'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Dermatologist',
      rating: 4.7,
      experience: '8 years',
      image: '👩‍⚕️',
      nextAvailable: '2024-01-15'
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialization: 'Pediatrician',
      rating: 4.9,
      experience: '20 years',
      image: '👨‍⚕️',
      nextAvailable: '2024-01-17'
    }
  ];

  // Generate available dates (next 14 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for this demo
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

    try {
      // For mock doctors, create a simulated booking
      if (selectedDoctor.id.startsWith('mock-')) {
        toast({
          title: "Demo Appointment Booked!",
          description: `Your demo appointment with ${selectedDoctor.name} is confirmed for ${selectedDate} at ${selectedTime}. In a real application, this would be saved to the database.`,
        });
        
        // Reset form
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedTime('');
        setStep('doctor');
        return;
      }

      // For real doctors, save to database
      const appointmentData = {
        patient_id: '', // Will be overridden by the service
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        appointment_type: 'consultation',
        reason: 'General consultation',
        status: 'scheduled' as const
      };

      await appointmentService.createAppointment(appointmentData);
      
      toast({
        title: "Appointment Booked Successfully!",
        description: `Your appointment with ${selectedDoctor.name} is confirmed for ${selectedDate} at ${selectedTime}.`,
      });
      
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
                ${step === stepName || ['datetime', 'confirm'].includes(step) && index < 2 || step === 'confirm' && index < 3
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
                <Card key={doctor.id} className="medical-card cursor-pointer hover:shadow-medical transition-all duration-300"
                  onClick={() => selectDoctor(doctor)}>
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{doctor.image}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <p className="text-muted-foreground">{doctor.specialization}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="secondary">
                            ⭐ {doctor.rating}
                          </Badge>
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

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{t('selectDate')}</span>
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
                  <span>{t('selectTime')}</span>
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
                  <h4 className="font-semibold">{selectedDoctor.name}</h4>
                  <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                  <Badge variant="secondary" className="mt-1">
                    ⭐ {selectedDoctor.rating} • {selectedDoctor.experience}
                  </Badge>
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

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">Appointment Notes</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Please arrive 15 minutes early for check-in</li>
                  <li>• Bring a valid ID and insurance card</li>
                  <li>• You'll receive a confirmation email shortly</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('datetime')}>
              Back
            </Button>
            <Button onClick={confirmAppointment} className="bg-gradient-primary">
              {t('bookAppointment')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;