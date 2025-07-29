import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, Clock, Star, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useLanguage } from '../context/LanguageContext';

interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  specialties: string[];
  rating: number;
  availability: '24/7' | 'Day Only';
  emergency: boolean;
  type: 'Government' | 'Private';
  coordinates: { lat: number; lng: number };
}

const HospitalLocator: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { t } = useLanguage();

  const hospitals: Hospital[] = [
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
      coordinates: { lat: 19.1618, lng: 72.9418 }
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
      coordinates: { lat: 26.8501, lng: 81.0242 }
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchLocation.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'emergency') matchesFilter = hospital.emergency;
    if (selectedFilter === '24/7') matchesFilter = hospital.availability === '24/7';
    if (selectedFilter === 'government') matchesFilter = hospital.type === 'Government';
    if (selectedFilter === 'private') matchesFilter = hospital.type === 'Private';
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => a.distance - b.distance);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          alert('Please enable location services to find nearby hospitals');
        }
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Hospital Locator</h1>
        <p className="text-lg text-muted-foreground">
          Find nearby hospitals and medical centers
        </p>
      </div>

      {/* Location Request */}
      {!userLocation && (
        <Card className="mb-6 border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Enable Location Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow location access to find the nearest hospitals
                  </p>
                </div>
              </div>
              <Button onClick={requestLocation}>
                Enable Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search location or hospital name..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
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
      </div>

      {/* Emergency Notice */}
      <Card className="mb-8 border-destructive bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Emergency Services</h3>
              <p className="text-sm">
                For immediate medical emergencies, call <strong>108</strong> for ambulance services
              </p>
            </div>
            <Button variant="destructive" onClick={() => handleCall('108')}>
              Call 108
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hospitals List */}
      <div className="space-y-4">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="medical-card hover:shadow-medical transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{hospital.name}</h3>
                      <p className="text-muted-foreground text-sm">{hospital.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{hospital.rating}</span>
                      </div>
                      {/* <p className="text-sm text-primary font-medium">{hospital.distance} km away</p> */}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={hospital.type === 'Government' ? 'secondary' : 'default'}>
                      {hospital.type}
                    </Badge>
                    {hospital.emergency && (
                      <Badge variant="destructive">Emergency</Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {hospital.availability}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                  <Button
                    variant="outline"
                    onClick={() => handleCall(hospital.phone)}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                  <Button
                    onClick={() => handleNavigate(hospital)}
                    className="gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hospitals found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default HospitalLocator;