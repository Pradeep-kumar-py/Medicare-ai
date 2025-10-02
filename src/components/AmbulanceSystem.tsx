import React, { useState, useEffect, useRef } from 'react';
import { 
  Ambulance, 
  MapPin, 
  Phone, 
  Clock, 
  Heart, 
  AlertTriangle, 
  Navigation, 
  Star,
  Activity,
  Shield,
  Timer,
  Users,
  Stethoscope,
  Truck,
  Zap,
  PhoneCall,
  Send,
  MessageSquare,
  Camera,
  Mic,
  Video
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

interface EmergencyRequest {
  id: string;
  patientName: string;
  location: { lat: number; lng: number };
  address: string;
  emergencyType: 'cardiac' | 'accident' | 'breathing' | 'bleeding' | 'stroke' | 'other';
  severity: 'critical' | 'urgent' | 'moderate';
  status: 'requesting' | 'dispatched' | 'enroute' | 'arrived' | 'transporting' | 'completed';
  timestamp: string;
  estimatedArrival?: number;
  ambulanceId?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  symptoms: string[];
  contactNumber: string;
  notes?: string;
}

interface AmbulanceUnit {
  id: string;
  vehicleNumber: string;
  type: 'basic' | 'advanced' | 'critical_care' | 'air_ambulance';
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  location: { lat: number; lng: number };
  crew: {
    driver: string;
    paramedic: string;
    doctor?: string;
  };
  equipment: string[];
  estimatedArrival?: number;
  currentPatient?: string;
  rating: number;
  completedCalls: number;
}

const AmbulanceSystem: React.FC = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<'emergency' | 'details' | 'tracking' | 'completed'>('emergency');
  const [emergencyRequest, setEmergencyRequest] = useState<EmergencyRequest | null>(null);
  const [availableAmbulances, setAvailableAmbulances] = useState<AmbulanceUnit[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceUnit | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioNotes, setAudioNotes] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock ambulance data
  const mockAmbulances: AmbulanceUnit[] = [
    {
      id: 'amb_001',
      vehicleNumber: 'DL-01-AM-1234',
      type: 'advanced',
      status: 'available',
      location: { lat: 28.6139, lng: 77.2090 },
      crew: {
        driver: 'Rajesh Kumar',
        paramedic: 'Dr. Priya Sharma',
        doctor: 'Dr. Amit Singh'
      },
      equipment: ['Defibrillator', 'Ventilator', 'IV Setup', 'Oxygen Tank', 'Cardiac Monitor'],
      rating: 4.8,
      completedCalls: 156
    },
    {
      id: 'amb_002',
      vehicleNumber: 'DL-02-AM-5678',
      type: 'critical_care',
      status: 'available',
      location: { lat: 28.6200, lng: 77.2150 },
      crew: {
        driver: 'Suresh Yadav',
        paramedic: 'Dr. Neha Gupta',
        doctor: 'Dr. Rakesh Verma'
      },
      equipment: ['Advanced Life Support', 'ICU Equipment', 'Blood Bank', 'Surgery Kit'],
      rating: 4.9,
      completedCalls: 203
    },
    {
      id: 'amb_003',
      vehicleNumber: 'DL-03-AM-9012',
      type: 'air_ambulance',
      status: 'available',
      location: { lat: 28.6100, lng: 77.2000 },
      crew: {
        driver: 'Captain Vikram',
        paramedic: 'Dr. Kavita Joshi',
        doctor: 'Dr. Arjun Malhotra'
      },
      equipment: ['Flight Medical Equipment', 'Portable ICU', 'Emergency Surgery Kit'],
      rating: 5.0,
      completedCalls: 89
    }
  ];

  const emergencyTypes = [
    { id: 'cardiac', label: 'Heart Attack', icon: Heart, color: 'bg-red-500', severity: 'critical' },
    { id: 'accident', label: 'Road Accident', icon: AlertTriangle, color: 'bg-orange-500', severity: 'urgent' },
    { id: 'breathing', label: 'Breathing Issues', icon: Activity, color: 'bg-blue-500', severity: 'critical' },
    { id: 'bleeding', label: 'Severe Bleeding', icon: Shield, color: 'bg-red-600', severity: 'critical' },
    { id: 'stroke', label: 'Stroke', icon: Zap, color: 'bg-purple-500', severity: 'critical' },
    { id: 'other', label: 'Other Emergency', icon: Stethoscope, color: 'bg-gray-500', severity: 'moderate' }
  ];

  // Get user location automatically on page load
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        setLoading(true);
        toast({
          title: "Getting Location",
          description: "Detecting your current location for emergency services...",
        });

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            setLoading(false);
            
            toast({
              title: "Location Detected",
              description: `Location found: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
            });

            // Reverse geocoding to get address (simplified)
            getAddressFromCoordinates(location);
          },
          (error) => {
            setLoading(false);
            let errorMessage = "Location access denied";
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable location services.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out.";
                break;
            }

            toast({
              title: "Location Error",
              description: errorMessage + " Using default location (Delhi).",
              variant: "destructive"
            });

            // Default to Delhi if location fails
            setUserLocation({ lat: 28.6139, lng: 77.2090 });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        toast({
          title: "GPS Not Supported",
          description: "Your device doesn't support GPS. Using default location.",
          variant: "destructive"
        });
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
      }
    };

    getCurrentLocation();
  }, []);

  // Get address from coordinates (simplified reverse geocoding)
  const getAddressFromCoordinates = async (location: { lat: number; lng: number }) => {
    try {
      // Using a simple reverse geocoding approach
      // In production, you might want to use Google Maps API or similar
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=16&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Extract key components for a cleaner address
        const addr = data.address;
        const components = [];
        
        // Add road/street if available
        if (addr.road) {
          components.push(addr.road);
        } else if (addr.pedestrian) {
          components.push(addr.pedestrian);
        } else if (addr.footway) {
          components.push(addr.footway);
        }
        
        // Add neighbourhood or suburb
        if (addr.neighbourhood) {
          components.push(addr.neighbourhood);
        } else if (addr.suburb) {
          components.push(addr.suburb);
        } else if (addr.residential) {
          components.push(addr.residential);
        }
        
        // Add city/locality
        if (addr.city) {
          components.push(addr.city);
        } else if (addr.town) {
          components.push(addr.town);
        } else if (addr.village) {
          components.push(addr.village);
        }
        
        // Add state if different from city
        if (addr.state && !components.includes(addr.state)) {
          components.push(addr.state);
        }
        
        // Create clean address
        let cleanAddress = components.slice(0, 3).join(', ');
        
        // If we have a postal code, add it
        if (addr.postcode) {
          cleanAddress += ` - ${addr.postcode}`;
        }
        
        // Fallback to display_name if no components found
        if (!cleanAddress.trim()) {
          // Extract only the first 3 parts of display_name for brevity
          const parts = data.display_name.split(',').slice(0, 3);
          cleanAddress = parts.join(', ');
        }
        
        // Update any existing emergency request with the cleaned address
        setEmergencyRequest(prev => prev ? {
          ...prev,
          address: cleanAddress || 'Current Location'
        } : null);
        
        toast({
          title: "Location Found",
          description: cleanAddress || 'Address detected successfully',
        });
      } else {
        // Fallback to coordinates if no address data
        const coordAddress = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        setEmergencyRequest(prev => prev ? {
          ...prev,
          address: `Current Location (${coordAddress})`
        } : null);
      }
    } catch (error) {
      console.log('Reverse geocoding failed, using coordinates');
      const coordAddress = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
      setEmergencyRequest(prev => prev ? {
        ...prev,
        address: `Current Location (${coordAddress})`
      } : null);
    }
  };

  // Emergency timer
  useEffect(() => {
    if (currentStep === 'tracking' && emergencyRequest) {
      timerRef.current = setInterval(() => {
        setEmergencyTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStep, emergencyRequest]);

  // Format location for display
  const formatLocationDisplay = (location: { lat: number; lng: number } | null): string => {
    if (!location) return 'Location not available';
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  // Calculate distance between two points
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  // Start emergency request
  const startEmergencyRequest = (emergencyType: string) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Getting your location for emergency response...",
        variant: "destructive"
      });
      
      // Try to get location again
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          // Retry emergency request with new location
          startEmergencyRequest(emergencyType);
        },
        () => {
          toast({
            title: "Location Error",
            description: "Cannot proceed without location. Please enable GPS.",
            variant: "destructive"
          });
        }
      );
      return;
    }

    const newRequest: EmergencyRequest = {
      id: `emergency_${Date.now()}`,
      patientName: '',
      location: userLocation,
      address: `Current Location (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`,
      emergencyType: emergencyType as any,
      severity: emergencyTypes.find(t => t.id === emergencyType)?.severity as any || 'moderate',
      status: 'requesting',
      timestamp: new Date().toISOString(),
      symptoms: [],
      contactNumber: ''
    };

    setEmergencyRequest(newRequest);
    setCurrentStep('details');

    // Get actual address from coordinates
    getAddressFromCoordinates(userLocation);

    toast({
      title: "Emergency Request Started",
      description: "Using your current GPS location for emergency response",
    });
  };

  // Submit emergency request
  const submitEmergencyRequest = () => {
    if (!emergencyRequest) return;

    setLoading(true);
    
    // Find nearest available ambulances
    const nearbyAmbulances = mockAmbulances
      .filter(amb => amb.status === 'available')
      .map(amb => ({
        ...amb,
        distance: calculateDistance(userLocation!, amb.location),
        estimatedArrival: Math.ceil(calculateDistance(userLocation!, amb.location) * 2) // 2 minutes per km
      }))
      .sort((a, b) => a.distance - b.distance);

    setAvailableAmbulances(nearbyAmbulances);

    setTimeout(() => {
      setLoading(false);
      setCurrentStep('tracking');
      
      // Auto-assign the nearest ambulance
      if (nearbyAmbulances.length > 0) {
        const assigned = nearbyAmbulances[0];
        setSelectedAmbulance(assigned);
        setEmergencyRequest(prev => prev ? {
          ...prev,
          status: 'dispatched',
          ambulanceId: assigned.id,
          estimatedArrival: assigned.estimatedArrival
        } : null);

        toast({
          title: "Ambulance Dispatched!",
          description: `${assigned.vehicleNumber} is on the way - ETA: ${assigned.estimatedArrival} minutes`,
        });
      }
    }, 3000);
  };

  // Start voice recording
  const startVoiceRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Describe the emergency situation...",
    });

    // Simulate recording for 10 seconds
    setTimeout(() => {
      setIsRecording(false);
      setAudioNotes(prev => [...prev, `Voice note recorded at ${new Date().toLocaleTimeString()}`]);
      toast({
        title: "Recording Saved",
        description: "Voice note has been sent to emergency services",
      });
    }, 5000);
  };

  // Emergency contact directly
  const callEmergencyServices = () => {
    window.location.href = 'tel:108';
    toast({
      title: "Calling Emergency Services",
      description: "Connecting to 108...",
    });
  };

  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get ambulance type color
  const getAmbulanceTypeColor = (type: string): string => {
    switch (type) {
      case 'basic': return 'bg-green-500';
      case 'advanced': return 'bg-blue-500';
      case 'critical_care': return 'bg-red-500';
      case 'air_ambulance': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (currentStep === 'emergency') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 animate-pulse">
            <Ambulance className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">🚨 Emergency Ambulance System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered emergency response with real-time tracking and instant medical assistance
          </p>
          
          {/* Location Status */}
          <div className="mt-6 max-w-md mx-auto">
            {loading ? (
              <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">Getting your location...</span>
              </div>
            ) : userLocation ? (
              <div className="flex items-center justify-center space-x-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div className="text-center">
                  <span className="text-green-800 dark:text-green-200 text-sm font-medium block">
                    📍 GPS Location Ready
                  </span>
                  <span className="text-green-600 dark:text-green-400 text-xs">
                    {formatLocationDisplay(userLocation)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200 text-sm font-medium">Location not available</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Emergency Call */}
        <Card className="mb-8 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <PhoneCall className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Immediate Emergency?</h3>
                  <p className="text-red-600 dark:text-red-400">Call 108 for instant assistance</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (navigator.geolocation) {
                      setLoading(true);
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          };
                          setUserLocation(location);
                          setLoading(false);
                          toast({
                            title: "Location Updated",
                            description: "Your current location has been refreshed",
                          });
                          getAddressFromCoordinates(location);
                        },
                        () => {
                          setLoading(false);
                          toast({
                            title: "Location Error",
                            description: "Could not update location",
                            variant: "destructive"
                          });
                        }
                      );
                    }
                  }}
                  disabled={loading}
                  className="text-sm"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Refresh Location
                </Button>
                <Button 
                  variant="destructive" 
                  size="lg" 
                  onClick={callEmergencyServices}
                  className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call 108 Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-orange-500" />
              Select Emergency Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card 
                    key={type.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary"
                    onClick={() => startEmergencyRequest(type.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${type.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{type.label}</h3>
                      <Badge 
                        variant={type.severity === 'critical' ? 'destructive' : type.severity === 'urgent' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {type.severity.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Stethoscope className="h-6 w-6 mr-2 text-blue-500" />
                Emergency Details
              </span>
              <Badge variant="destructive">
                {emergencyTypes.find(t => t.id === emergencyRequest?.emergencyType)?.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Patient Name *</label>
                  <Input
                    placeholder="Enter patient name"
                    value={emergencyRequest?.patientName || ''}
                    onChange={(e) => setEmergencyRequest(prev => prev ? {...prev, patientName: e.target.value} : null)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number *</label>
                  <Input
                    placeholder="Enter contact number"
                    value={emergencyRequest?.contactNumber || ''}
                    onChange={(e) => setEmergencyRequest(prev => prev ? {...prev, contactNumber: e.target.value} : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <Input
                    type="number"
                    placeholder="Patient age"
                    value={emergencyRequest?.patientAge || ''}
                    onChange={(e) => setEmergencyRequest(prev => prev ? {...prev, patientAge: parseInt(e.target.value)} : null)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <Select
                    value={emergencyRequest?.patientGender || ''}
                    onValueChange={(value) => setEmergencyRequest(prev => prev ? {...prev, patientGender: value as any} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Emergency Location</label>
                <div className="flex items-center justify-between space-x-2 p-3 bg-background border border-input rounded-md">
                  <div className="flex items-center space-x-2 flex-1">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium block text-foreground">{emergencyRequest?.address}</span>
                      {userLocation && (
                        <span className="text-xs text-muted-foreground">
                          GPS: {formatLocationDisplay(userLocation)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (userLocation && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const newLocation = {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude
                            };
                            setUserLocation(newLocation);
                            setEmergencyRequest(prev => prev ? {
                              ...prev,
                              location: newLocation,
                              address: `Updated Location (${newLocation.lat.toFixed(4)}, ${newLocation.lng.toFixed(4)})`
                            } : null);
                            getAddressFromCoordinates(newLocation);
                            toast({
                              title: "Location Updated",
                              description: "Emergency location refreshed"
                            });
                          }
                        );
                      }
                    }}
                    className="text-xs"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Update
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Describe the Situation</label>
                <Textarea
                  placeholder="Describe symptoms, what happened, current condition..."
                  rows={4}
                  value={emergencyRequest?.notes || ''}
                  onChange={(e) => setEmergencyRequest(prev => prev ? {...prev, notes: e.target.value} : null)}
                />
              </div>
            </div>

            {/* Voice Recording */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Voice Notes (Optional)</h3>
              <div className="flex flex-col space-y-4">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={startVoiceRecording}
                  disabled={isRecording}
                  className="w-full"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRecording ? "Recording..." : "Record Voice Note"}
                </Button>
                
                {audioNotes.length > 0 && (
                  <div className="space-y-2">
                    {audioNotes.map((note, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                        <Mic className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4 pt-6 border-t">
              <Button
                onClick={submitEmergencyRequest}
                disabled={!emergencyRequest?.patientName || !emergencyRequest?.contactNumber || loading}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Timer className="h-5 w-5 mr-2 animate-spin" />
                    Finding Nearest Ambulance...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Request Emergency Ambulance
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setCurrentStep('emergency')}
                className="w-full"
              >
                Back to Emergency Types
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'tracking') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
            <Ambulance className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Ambulance En Route</h1>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <Badge variant="default" className="bg-green-600">
              {emergencyRequest?.status?.toUpperCase()}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="font-mono text-2xl font-bold text-blue-600">
              {formatTime(emergencyTimer)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Tracking Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Live Tracking
                </span>
                <Badge variant="outline" className="animate-pulse">
                  ETA: {selectedAmbulance?.estimatedArrival} min
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
                {/* Your Location */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    Emergency Location
                  </div>
                </div>

                {/* Ambulance Location */}
                <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <Ambulance className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {selectedAmbulance?.vehicleNumber}
                  </div>
                </div>

                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 75% 25% Q 60% 40% 50% 50%"
                    stroke="url(#routeGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>

                {/* Map Info */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Live Tracking</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>🔴 Your Location</div>
                    <div>🟢 Ambulance Position</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ambulance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Assigned Ambulance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedAmbulance && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedAmbulance.vehicleNumber}</h3>
                      <Badge className={`${getAmbulanceTypeColor(selectedAmbulance.type)} text-white`}>
                        {selectedAmbulance.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-semibold">{selectedAmbulance.rating}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedAmbulance.completedCalls} completed calls
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Medical Crew</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Driver: {selectedAmbulance.crew.driver}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Paramedic: {selectedAmbulance.crew.paramedic}</span>
                      </div>
                      {selectedAmbulance.crew.doctor && (
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Doctor: {selectedAmbulance.crew.doctor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Medical Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmbulance.equipment.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Communication Panel */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Emergency Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1"
                onClick={() => window.location.href = `tel:${selectedAmbulance?.crew.paramedic || '108'}`}
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm">Call Paramedic</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1"
                onClick={() => toast({ title: "Video Call", description: "Connecting to ambulance crew..." })}
              >
                <Video className="h-6 w-6" />
                <span className="text-sm">Video Call</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1"
                onClick={() => toast({ title: "Emergency Services", description: "Calling 108..." })}
              >
                <PhoneCall className="h-6 w-6" />
                <span className="text-sm">Call 108</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1"
                onClick={() => toast({ title: "Location Shared", description: "Updated location sent to ambulance" })}
              >
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Share Location</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Instructions */}
        <Alert className="mt-6 border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>While waiting for the ambulance:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Stay calm and keep the patient comfortable</li>
              <li>Do not move the patient unless absolutely necessary</li>
              <li>Keep airways clear and monitor breathing</li>
              <li>Apply pressure to any bleeding wounds</li>
              <li>Stay on the line with emergency services if needed</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

export default AmbulanceSystem;