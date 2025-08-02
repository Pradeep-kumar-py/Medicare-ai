import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { profileService } from '../integrations/supabase/services';
import type { Tables } from '../integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isDoctor: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      // Add timeout to prevent infinite loading - increased to 20 seconds
      const profilePromise = profileService.getCurrentProfile();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 20000)
      );
      
      const profile = await Promise.race([profilePromise, timeoutPromise]);
      setProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't block auth flow if profile fetch fails
      setProfile(null);
      // Show a non-blocking toast notification
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.warn('Profile fetch timed out - continuing with limited functionality');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Add timeout for initialization
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout');
            setLoading(false);
          }
        }, 15000);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        // Clear timeout if we get a response
        clearTimeout(initTimeout);
        
        if (error) {
          console.error('Session error:', error);
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Don't set loading here as fetchProfile handles it
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []); // Remove loading dependency to prevent infinite loops

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      // Attempt sign in with retry on network failures
      let data: any, error: any;
      const maxSignInRetries = 2;
      for (let attempt = 1; attempt <= maxSignInRetries; attempt++) {
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        if (!error || !error.message?.includes('Load failed')) break;
        console.warn(`Signin network error (attempt ${attempt}):`, error.message);
        if (attempt < maxSignInRetries) {
          await new Promise(res => setTimeout(res, 500 * attempt));
        }
      }
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', data.user?.email);
      // Update context state
      if (data.user) {
        setSession(data.session ?? null);
        setUser(data.user);
        // Fetch profile for the signed-in user
        await fetchProfile(data.user.id);
      }
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('🔄 Attempting sign up for:', email);
      console.log('📋 User data:', userData);
      
      // First, try normal signup with retry on network failures
      let data: any, error: any;
      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        ({ data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: userData },
        }));
        // Break on success or non-network error
        if (!error || !error.message?.includes('Load failed')) break;
        console.warn(`Signup network error (attempt ${attempt}):`, error.message);
        if (attempt < maxRetries) {
          // wait before retry
          await new Promise(res => setTimeout(res, 500 * attempt));
        }
      }
      
      if (error) {
        console.error('❌ Auth signup error:', error);
        
        // If it's a database trigger error, try alternative approach
        if (error.message?.includes('Database error saving new user') || 
            error.message?.includes('function') ||
            error.message?.includes('trigger')) {
          
          console.log('🔄 Database trigger failed, trying alternative signup...');
          
          // Try signup without metadata first
          const { data: altData, error: altError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (altError) {
            console.error('❌ Alternative signup also failed:', altError);
            throw altError;
          }
          
          console.log('✅ Alternative signup successful:', altData.user?.email);
          
          // If successful, manually create profile
          if (altData.user) {
            console.log('🔄 Creating profile manually...');
            
            try {
              // First check if profile already exists
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', altData.user.id)
                .single();

              if (!existingProfile) {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert({
                    id: altData.user.id,
                    email: email,
                    full_name: userData?.full_name || '',
                    role: userData?.role || 'patient',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                
                if (profileError) {
                  if (profileError.message?.includes('duplicate key')) {
                    console.log('✅ Profile already exists, continuing...');
                  } else {
                    console.error('❌ Manual profile creation failed:', profileError);
                    console.warn('⚠️ User created but profile creation failed');
                  }
                } else {
                  console.log('✅ Profile created manually');
                }
              } else {
                console.log('✅ Profile already exists');
              }
            } catch (profileErr) {
              console.error('❌ Profile creation exception:', profileErr);
            }
          }
          
          return { user: altData.user, error: null };
        }
        
        throw error;
      }
      
      console.log('✅ Sign up successful:', data.user?.email);
      // Automatically sign in the new user to update context
      if (data.user) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInErr && signInData.user) {
          setSession(signInData.session ?? null);
          setUser(signInData.user);
          await fetchProfile(signInData.user.id);
        }
      }
      return { user: data.user, error: null };
    } catch (error) {
      console.error('💥 Final signup error:', error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const updatedProfile = await profileService.updateProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isDoctor: profile?.role === 'doctor',
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
