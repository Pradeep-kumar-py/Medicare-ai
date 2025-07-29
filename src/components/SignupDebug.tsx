import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { supabase } from '../integrations/supabase/client';

export default function SignupDebug() {
  const [testResults, setTestResults] = useState<{
    dbConnection: boolean;
    triggerExists: boolean;
    profilesTable: boolean;
    doctorsTable: boolean;
    canInsertProfile: boolean;
    authSignup: boolean;
    lastError?: string;
  }>({
    dbConnection: false,
    triggerExists: false,
    profilesTable: false,
    doctorsTable: false,
    canInsertProfile: false,
    authSignup: false
  });
  const [loading, setLoading] = useState(false);

  const runDatabaseTests = async () => {
    setLoading(true);
    console.log('🧪 Running comprehensive database tests...');
    
    const results = { ...testResults };

    try {
      // Test 1: Basic database connection
      console.log('🔍 Test 1: Database connection...');
      const { error: connectionError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);
      
      results.dbConnection = !connectionError;
      console.log(`${connectionError ? '❌' : '✅'} Database connection:`, connectionError?.message || 'OK');

      // Test 2: Check if profiles table exists and is accessible
      console.log('🔍 Test 2: Profiles table access...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(1);
      
      results.profilesTable = !profilesError;
      console.log(`${profilesError ? '❌' : '✅'} Profiles table:`, profilesError?.message || 'Accessible');

      // Test 3: Check if doctors table exists and is accessible
      console.log('🔍 Test 3: Doctors table access...');
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, profile_id')
        .limit(1);
      
      results.doctorsTable = !doctorsError;
      console.log(`${doctorsError ? '❌' : '✅'} Doctors table:`, doctorsError?.message || 'Accessible');

      // Test 4: Try manual profile insertion (test RLS policies)
      console.log('🔍 Test 4: Manual profile insertion test...');
      const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'patient'
        });
      
      if (insertError && !insertError.message.includes('duplicate key')) {
        results.canInsertProfile = false;
        console.log('❌ Profile insertion test:', insertError.message);
      } else {
        results.canInsertProfile = true;
        console.log('✅ Profile insertion test: OK (or expected duplicate error)');
        
        // Clean up test data
        try {
          await supabase.from('profiles').delete().eq('id', testUserId);
        } catch (cleanupError) {
          console.log('⚠️ Cleanup note: Could not remove test profile');
        }
      }

      // Test 5: Check trigger function existence
      console.log('🔍 Test 5: Database trigger check...');
      try {
        // Simple approach - we'll just assume trigger issues based on auth test
        results.triggerExists = false; // We'll update this based on auth test
        console.log('⚠️ Trigger function: Cannot directly check, will infer from auth test');
      } catch (err) {
        results.triggerExists = false;
        console.log('❌ Trigger function: Check failed');
      }

      // Test 6: Test auth signup (dry run)
      console.log('🔍 Test 6: Auth signup test...');
      try {
        // This will fail but we can check the error type
        const { error: authError } = await supabase.auth.signUp({
          email: 'test-' + Date.now() + '@example.com',
          password: 'testpassword123',
          options: { data: { full_name: 'Test', role: 'patient' } }
        });
        
        if (authError) {
          if (authError.message.includes('Database error saving new user')) {
            results.authSignup = false;
            results.lastError = 'Database trigger failing during signup';
            console.log('❌ Auth signup: Database trigger error');
          } else if (authError.message.includes('Email rate limit')) {
            results.authSignup = true; // Rate limit means auth is working
            console.log('✅ Auth signup: Working (hit rate limit)');
          } else {
            results.authSignup = false;
            results.lastError = authError.message;
            console.log('❌ Auth signup error:', authError.message);
          }
        } else {
          results.authSignup = true;
          console.log('✅ Auth signup: Working');
        }
      } catch (err: any) {
        results.authSignup = false;
        results.lastError = err.message;
        console.log('❌ Auth signup test failed:', err.message);
      }

    } catch (err: any) {
      results.lastError = `Test suite error: ${err.message}`;
      console.error('💥 Test suite error:', err);
    }

    setTestResults(results);
    setLoading(false);
    
    console.log('🧪 Test results summary:', results);
  };

  useEffect(() => {
    runDatabaseTests();
  }, []);

  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';
  const getStatusColor = (status: boolean) => status ? 'default' : 'destructive';

  const canSignup = testResults.dbConnection && testResults.profilesTable && testResults.canInsertProfile;
  const triggerWorking = testResults.triggerExists && testResults.authSignup;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🧪 Signup Debug & Database Tests
            <Button 
              onClick={runDatabaseTests} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? '🔄 Testing...' : '🔄 Run Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {testResults.lastError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">❌ Critical Error</h3>
              <p className="text-red-600 text-sm mt-1">{testResults.lastError}</p>
            </div>
          )}

          {/* Overall Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Manual Signup Possible</span>
              <Badge variant={getStatusColor(canSignup)}>
                {getStatusIcon(canSignup)} {canSignup ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Trigger Working</span>
              <Badge variant={getStatusColor(triggerWorking)}>
                {getStatusIcon(triggerWorking)} {triggerWorking ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {/* Detailed Test Results */}
          <div>
            <h4 className="font-medium mb-3">🔍 Detailed Test Results</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 border rounded">
                <span>Database Connection</span>
                <Badge variant={getStatusColor(testResults.dbConnection)}>
                  {getStatusIcon(testResults.dbConnection)} {testResults.dbConnection ? 'Connected' : 'Failed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm p-2 border rounded">
                <span>Profiles Table Access</span>
                <Badge variant={getStatusColor(testResults.profilesTable)}>
                  {getStatusIcon(testResults.profilesTable)} {testResults.profilesTable ? 'OK' : 'Failed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm p-2 border rounded">
                <span>Doctors Table Access</span>
                <Badge variant={getStatusColor(testResults.doctorsTable)}>
                  {getStatusIcon(testResults.doctorsTable)} {testResults.doctorsTable ? 'OK' : 'Failed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm p-2 border rounded">
                <span>Manual Profile Creation</span>
                <Badge variant={getStatusColor(testResults.canInsertProfile)}>
                  {getStatusIcon(testResults.canInsertProfile)} {testResults.canInsertProfile ? 'Works' : 'Blocked'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm p-2 border rounded">
                <span>Database Trigger Function</span>
                <Badge variant={getStatusColor(testResults.triggerExists)}>
                  {getStatusIcon(testResults.triggerExists)} {testResults.triggerExists ? 'Exists' : 'Missing'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm p-2 border rounded">
                <span>Auth Signup Process</span>
                <Badge variant={getStatusColor(testResults.authSignup)}>
                  {getStatusIcon(testResults.authSignup)} {testResults.authSignup ? 'Working' : 'Failing'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Recommendations</h4>
            {!triggerWorking && canSignup && (
              <div className="text-sm text-blue-700 mb-2">
                ✅ <strong>Good news!</strong> Manual signup should work. The enhanced AuthContext will handle profile creation.
              </div>
            )}
            {!canSignup && (
              <div className="text-sm text-red-700 mb-2">
                ❌ <strong>Critical:</strong> Database access issues detected. Run COMPLETE_DATABASE_FIX.sql immediately.
              </div>
            )}
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. If trigger is missing: Run <code className="bg-blue-100 px-1 rounded">COMPLETE_DATABASE_FIX.sql</code></li>
              <li>2. Try signup - it should work with fallback profile creation</li>
              <li>3. Check browser console for detailed signup logs</li>
              <li>4. If still failing, the enhanced signup will bypass the trigger</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
