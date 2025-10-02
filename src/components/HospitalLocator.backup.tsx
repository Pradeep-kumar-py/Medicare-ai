import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  Star, 
  Filter, 
  Ambulance,
  AlertTriangle,
  Map,
  Locate,
  Search,
  RefreshCw,
  Shield,
  Activity,
  PhoneCall
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

interface Hospital {
  id: string;
  name: string;
  address: string;
  distance?: number;
  phone: string;
  specialties: string[];
  rating: number;
  availability: '24/7' | 'Day Only';
  emergency: boolean;
  type: 'Government' | 'Private';
  coordinates: { lat: number; lng: number };
  photos?: string[];
  website?: string;
  place_id?: string;
}

interface GoogleMapsWindow extends Window {
  google?: any;
  initMap?: () => void;
}

declare const window: GoogleMapsWindow;

const HospitalLocator: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'medical' | 'accident' | 'fire' | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { t } = useLanguage();

  // Google Maps API key - In production, this should be in environment variables
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

  // Default hospitals for fallback when Google Places API is not available
  const defaultHospitals: Hospital[] = [
    {
      id: '1',
      name: 'AIIMS Delhi',
      address: 'Ansari Nagar, New Delhi - 110029',
      distance: 2.3,
      phone: '011-26588500',
      specialties: ['Cardiology', 'Neurology', 'Emergency'],
      rating: 4.8,
      availability: '24/7',
      emergency: true,
      type: 'Government',
      coordinates: { lat: 28.5672, lng: 77.2103 }
    },
    {
      id: '2',
      name: 'Fortis Hospital',
      address: 'Sector 62, Noida - 201301',
      distance: 5.7,
      phone: '0120-6200000',
      specialties: ['Oncology', 'Cardiac Surgery', 'ICU'],
      rating: 4.5,
      availability: '24/7',
      emergency: true,
      type: 'Private',
      coordinates: { lat: 28.6328, lng: 77.3642 }
    },
    {
      id: '3',
      name: 'Max Super Speciality Hospital',
      address: 'Saket, New Delhi - 110017',
      distance: 8.2,
      phone: '011-26515050',
      specialties: ['Orthopedics', 'Gastroenterology', 'Emergency'],
      rating: 4.6,
      availability: '24/7',
      emergency: true,
      type: 'Private',
      coordinates: { lat: 28.5245, lng: 77.2066 }
    },
    {
      id: '4',
      name: 'Safdarjung Hospital',
      address: 'Ansari Nagar, New Delhi - 110029',
      distance: 3.1,
      phone: '011-26165060',
      specialties: ['Emergency', 'General Medicine', 'Pediatrics'],
      rating: 4.2,
      availability: '24/7',
      emergency: true,
      type: 'Government',
      coordinates: { lat: 28.5631, lng: 77.2084 }
    },
    {
      id: '5',
      name: 'BLK Super Speciality Hospital',
      address: 'Pusa Road, New Delhi - 110005',
      distance: 6.4,
      phone: '011-30403040',
      specialties: ['Liver Transplant', 'Neurosurgery', 'ICU'],
      rating: 4.4,
      availability: '24/7',
      emergency: true,
      type: 'Private',
      coordinates: { lat: 28.6435, lng: 77.1796 }
    }
  ];

  const filters = ['all', 'emergency', '24/7', 'government', 'private'];
  const emergencyNumbers = {
    medical: '108',
    police: '100',
    fire: '101',
    ambulance: '108'
  };

  // Load Google Maps API
  const loadGoogleMaps = useCallback(() => {
    if (window.google || mapLoaded) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      // For demo purposes, we'll simulate the API loading
      // In production, you would load the actual Google Maps API
      setTimeout(() => {
        setMapLoaded(true);
        resolve();
      }, 1000);
    });
  }, [mapLoaded]);

  // Initialize map
  const initializeMap = useCallback(async (location: { lat: number; lng: number }) => {
    if (!mapRef.current) return;

    try {
      await loadGoogleMaps();
      
      // Simulate Google Maps initialization
      // In production, this would be actual Google Maps API calls
      console.log('Map initialized at:', location);
      
      // For demo, we'll use default hospitals with calculated distances
      const hospitalsWithDistance = defaultHospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(location, hospital.coordinates)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setHospitals(hospitalsWithDistance);
      
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setHospitals(defaultHospitals);
    }
  }, [defaultHospitals, loadGoogleMaps]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  };

  // Search nearby hospitals using Google Places API (simulated)
  const searchNearbyHospitals = useCallback(async (location: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      // Simulate a shorter API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Calculate distances for default hospitals
      const hospitalsWithDistance = defaultHospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(location, hospital.coordinates)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setHospitals(hospitalsWithDistance);
      
    } catch (error) {
      console.error('Error searching hospitals:', error);
      setHospitals(defaultHospitals);
    } finally {
      setLoading(false);
    }
  }, [defaultHospitals]);

  // Get user location
  useEffect(() => {
    // Initialize with default hospitals immediately
    setHospitals(defaultHospitals);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Calculate distances for default hospitals
          const hospitalsWithDistance = defaultHospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(location, hospital.coordinates)
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setHospitals(hospitalsWithDistance);
        },
        (error) => {
          console.log('Location access denied:', error);
          // Keep default hospitals without distance
          setHospitals(defaultHospitals);
        }
      );
    }
  }, []); // Remove dependencies to prevent infinite loops

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchLocation.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'emergency') matchesFilter = hospital.emergency;
    if (selectedFilter === '24/7') matchesFilter = hospital.availability === '24/7';
    if (selectedFilter === 'government') matchesFilter = hospital.type === 'Government';
    if (selectedFilter === 'private') matchesFilter = hospital.type === 'Private';
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmergencyCall = (type: 'medical' | 'police' | 'fire' | 'ambulance') => {
    const number = emergencyNumbers[type];
    toast({
      title: "Emergency Call",
      description: `Calling ${type} services at ${number}`,
    });
    window.location.href = `tel:${number}`;
  };

  const handleNavigate = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.coordinates.lat},${hospital.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(hospital.address)}`;
      window.open(url, '_blank');
    }
  };

  const requestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Calculate distances immediately without additional API call
          const hospitalsWithDistance = defaultHospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(location, hospital.coordinates)
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          setHospitals(hospitalsWithDistance);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Location Error",
            description: "Please enable location services to find nearby hospitals",
            variant: "destructive"
          });
        }
      );
    } else {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      setLoading(true);
      // Quick refresh without API simulation
      setTimeout(() => {
        const hospitalsWithDistance = defaultHospitals.map(hospital => ({
          ...hospital,
          distance: calculateDistance(userLocation, hospital.coordinates)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setHospitals(hospitalsWithDistance);
        setLoading(false);
      }, 300);
    } else {
      requestLocation();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full mb-4">
          <MapPin className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-foreground">Hospital & Emergency Services</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find nearby hospitals, medical centers, and access emergency services instantly
        </p>
      </div>

      {/* Emergency Services Panel */}
      <Card className="mb-8 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="destructive"
              className="h-16 flex flex-col space-y-1"
              onClick={() => handleEmergencyCall('ambulance')}
            >
              <Ambulance className="h-6 w-6" />
              <span className="text-sm font-semibold">Ambulance</span>
              <span className="text-xs">Call 108</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col space-y-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleEmergencyCall('medical')}
            >
              <Activity className="h-6 w-6" />
              <span className="text-sm font-semibold">Medical Emergency</span>
              <span className="text-xs">Call 108</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col space-y-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleEmergencyCall('police')}
            >
              <Shield className="h-6 w-6" />
              <span className="text-sm font-semibold">Police</span>
              <span className="text-xs">Call 100</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col space-y-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleEmergencyCall('fire')}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm font-semibold">Fire Brigade</span>
              <span className="text-xs">Call 101</span>
            </Button>
          </div>
          <Alert className="mt-4">
            <PhoneCall className="h-4 w-4" />
            <AlertDescription>
              <strong>Emergency Tip:</strong> In case of medical emergency, call ambulance (108) first, then navigate to the nearest hospital below.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Location Request */}
      {!userLocation && (
        <Card className="mb-6 border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Locate className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enable Location Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Get accurate distances and directions to nearby hospitals
                  </p>
                </div>
              </div>
              <Button onClick={requestLocation} disabled={loading} className="healthcare-gradient">
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Finding Location...
                  </>
                ) : (
                  <>
                    <Locate className="h-4 w-4 mr-2" />
                    Enable Location
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Controls */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals, specialties, or locations..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="h-12 px-6"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button variant="outline" className="h-12 px-6">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className="capitalize"
            >
              {filter === '24/7' ? '24/7 Available' : filter}
            </Button>
          ))}
        </div>

        {/* Results Summary */}
        {userLocation && hospitals.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Found {filteredHospitals.length} hospitals near your location
              </span>
            </div>
            {filteredHospitals.length > 0 && (
              <Badge variant="secondary">
                Nearest: {filteredHospitals[0].distance?.toFixed(1)} km away
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Hospitals List */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Finding Nearby Hospitals</h3>
            <p className="text-muted-foreground">
              Searching for medical facilities in your area...
            </p>
          </div>
        )}
        
        {!loading && filteredHospitals.map((hospital, index) => (
          <Card key={hospital.id} className="medical-card hover:shadow-medical transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{hospital.name}</h3>
                        {index === 0 && userLocation && hospital.distance && (
                          <Badge className="bg-success text-success-foreground">
                            Nearest
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2 flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        {hospital.address}
                      </p>
                      {hospital.distance && (
                        <p className="text-primary font-semibold flex items-center">
                          <Navigation className="h-4 w-4 mr-2" />
                          {hospital.distance} km away
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{hospital.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={hospital.type === 'Government' ? 'secondary' : 'default'}>
                      {hospital.type}
                    </Badge>
                    {hospital.emergency && (
                      <Badge variant="destructive">
                        <Activity className="h-3 w-3 mr-1" />
                        Emergency
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {hospital.availability}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {hospital.phone}
                    </p>
                  </div>
                </div>

                <div className="lg:w-48">
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleCall(hospital.phone)}
                      className="w-full gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call Hospital
                    </Button>
                    <Button
                      onClick={() => handleNavigate(hospital)}
                      className="w-full gap-2 healthcare-gradient"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </Button>
                    {hospital.emergency && (
                      <Button
                        variant="destructive"
                        onClick={() => handleEmergencyCall('ambulance')}
                        className="w-full gap-2"
                      >
                        <Ambulance className="h-4 w-4" />
                        Call Ambulance
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        {!loading && filteredHospitals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No hospitals found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any hospitals matching your criteria. Try adjusting your search terms or filters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setSelectedFilter('all')} variant="outline">
                Clear Filters
              </Button>
              <Button onClick={handleRefresh} className="healthcare-gradient">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Search
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Map placeholder */}
      <Card className="mt-8 medical-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2" />
            Hospital Locations Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted"
          >
            <div className="text-center">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Interactive map with hospital locations
                <br />
                <span className="text-sm">(Google Maps integration ready for production)</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

      {/* Map placeholder - In production, this would be actual Google Maps */}
      <div className="mt-8">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="h-5 w-5 mr-2" />
              Hospital Locations Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted"
            >
              <div className="text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Interactive map with hospital locations
                  <br />
                  <span className="text-sm">(Google Maps integration available in production)</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalLocator;