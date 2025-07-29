import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { supabase } from '../integrations/supabase/client';

interface Doctor {
  id: string;
  profile_id: string;
  specialization: string;
  license_number: string;
  experience_years: number;
  consultation_fee: number;
  is_available: boolean;
  created_at: string;
  bio?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  profile?: {
    full_name: string;
    email: string;
  };
}

export default function DatabaseDebug() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching doctors from database...');
      
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:profiles(
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (doctorsError) {
        console.error('❌ Error fetching doctors:', doctorsError);
        throw doctorsError;
      }

      console.log('✅ Doctors data fetched successfully:', doctorsData);
      console.log('📊 Number of doctors found:', doctorsData?.length || 0);
      
      if (doctorsData && doctorsData.length > 0) {
        doctorsData.forEach((doctor, index) => {
          console.log(`👨‍⚕️ Doctor ${index + 1}:`, {
            id: doctor.id,
            profile_id: doctor.profile_id,
            name: doctor.profile?.full_name || 'No name',
            email: doctor.profile?.email || 'No email',
            specialization: doctor.specialization,
            license: doctor.license_number,
            experience: doctor.experience_years,
            fee: doctor.consultation_fee,
            available: doctor.is_available,
            created: doctor.created_at
          });
        });
      } else {
        console.log('📭 No doctors found in database');
      }

      setDoctors(doctorsData || []);
    } catch (err: any) {
      console.error('💥 Error in fetchDoctors:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      console.log('🔍 Fetching all profiles...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('✅ Profiles data fetched successfully:', profilesData);
      console.log('📊 Number of profiles found:', profilesData?.length || 0);
      
      if (profilesData && profilesData.length > 0) {
        profilesData.forEach((profile, index) => {
          console.log(`👤 Profile ${index + 1}:`, {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role,
            created: profile.created_at
          });
        });
      }

      setProfiles(profilesData || []);
    } catch (err: any) {
      console.error('💥 Error in fetchProfiles:', err);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('🔌 Testing database connection...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);

      if (error) {
        console.error('❌ Database connection failed:', error);
        setError('Database connection failed: ' + error.message);
      } else {
        console.log('✅ Database connection successful');
        setError(null);
      }
    } catch (err: any) {
      console.error('💥 Connection test error:', err);
      setError('Connection error: ' + err.message);
    }
  };

  useEffect(() => {
    testDatabaseConnection();
    fetchProfiles();
    fetchDoctors();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🔬 Database Debug Console
            <div className="flex gap-2">
              <Button 
                onClick={fetchDoctors} 
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? '🔄 Loading...' : '🔄 Refresh Doctors'}
              </Button>
              <Button 
                onClick={fetchProfiles} 
                variant="outline"
                size="sm"
              >
                🔄 Refresh Profiles
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-medium">❌ Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profiles Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                👥 Profiles ({profiles.length})
              </h3>
              {profiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No profiles found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {profiles.map((profile, index) => (
                    <div key={profile.id} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{profile.full_name || 'No name'}</span>
                        <Badge variant={profile.role === 'doctor' ? 'default' : 'secondary'}>
                          {profile.role || 'patient'}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{profile.email}</p>
                      <p className="text-xs text-gray-400">ID: {profile.id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctors Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                👨‍⚕️ Doctors ({doctors.length})
              </h3>
              {doctors.length === 0 ? (
                <p className="text-gray-500 text-sm">No doctors found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {doctors.map((doctor, index) => (
                    <div key={doctor.id} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {doctor.profile?.full_name || 'No name'}
                        </span>
                        <Badge variant={doctor.is_available ? 'default' : 'destructive'}>
                          {doctor.is_available ? '🟢 Available' : '🔴 Offline'}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{doctor.specialization}</p>
                      <p className="text-gray-600">
                        ${doctor.consultation_fee} • {doctor.experience_years} years
                      </p>
                      <p className="text-xs text-gray-400">
                        License: {doctor.license_number}
                      </p>
                      <p className="text-xs text-gray-400">
                        Profile ID: {doctor.profile_id}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🔍 Debug Instructions</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Open browser developer tools (F12)</li>
              <li>2. Go to Console tab</li>
              <li>3. Click "Refresh Doctors" to see detailed console logs</li>
              <li>4. Check the output for any error messages</li>
              <li>5. Try creating a doctor account to test the signup flow</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
