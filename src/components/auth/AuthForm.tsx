import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Eye, EyeOff, Mail, Lock, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isDoctorSignup, setIsDoctorSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    // Doctor specific fields
    specialization: '',
    licenseNumber: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
    education: '',
    certifications: '',
    languages: 'English'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { signIn, signUp } = useAuth();

  const resetFormData = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
      specialization: '',
      licenseNumber: '',
      experienceYears: '',
      consultationFee: '',
      bio: '',
      education: '',
      certifications: '',
      languages: 'English'
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Doctor-specific validation
      if (isDoctorSignup) {
        if (!formData.specialization) {
          newErrors.specialization = 'Specialization is required';
        }
        if (!formData.licenseNumber) {
          newErrors.licenseNumber = 'License number is required';
        }
        if (!formData.experienceYears || parseInt(formData.experienceYears) < 0) {
          newErrors.experienceYears = 'Valid experience years required';
        }
        if (!formData.consultationFee || parseFloat(formData.consultationFee) <= 0) {
          newErrors.consultationFee = 'Valid consultation fee required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle password reset
    if (showForgotPassword) {
      if (!formData.email) {
        setErrors({ email: 'Email is required for password reset' });
        return;
      }
      
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        });
        setShowForgotPassword(false);
      } catch (error: any) {
        toast({
          title: "Password Reset Failed",
          description: error.message || "Failed to send password reset email",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { user, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          let errorMessage = "Invalid email or password";
          if (error.message) {
            if (error.message.includes("Invalid login credentials")) {
              errorMessage = "Invalid email or password. Please check your credentials.";
            } else if (error.message.includes("Email not confirmed")) {
              errorMessage = "Please check your email and click the confirmation link.";
            } else {
              errorMessage = error.message;
            }
          }
          
          toast({
            title: "Sign In Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } else if (user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          onSuccess?.();
        }
      } else {
        const userData = { 
          full_name: formData.fullName,
          role: isDoctorSignup ? 'doctor' : 'patient'
        };

        console.log('Signup userData:', userData);
        console.log('Signup email:', formData.email);
        console.log('Is doctor signup:', isDoctorSignup);

        const { user, error } = await signUp(
          formData.email, 
          formData.password, 
          userData
        );
        
        if (error) {
          console.error('Signup error:', error);
          let errorMessage = "Failed to create account";
          if (error.message) {
            if (error.message.includes("User already registered")) {
              errorMessage = "An account with this email already exists. Please sign in instead.";
            } else if (error.message.includes("Password should be at least")) {
              errorMessage = "Password should be at least 6 characters long.";
            } else if (error.message.includes("Database error saving new user")) {
              errorMessage = "Database connection issue. Please try again in a moment.";
            } else {
              errorMessage = error.message;
            }
          }
          
          toast({
            title: "Sign Up Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } else if (user) {
          console.log('User created successfully:', user.id);
          
          // Manually create profile if trigger didn't work
          try {
            console.log('Checking if profile exists...');
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single();

            if (!existingProfile) {
              console.log('Profile not found, creating manually...');
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: formData.email,
                  full_name: formData.fullName,
                  role: isDoctorSignup ? 'doctor' : 'patient'
                });

              if (profileError) {
                if (profileError.message?.includes('duplicate key')) {
                  console.log('Profile already exists (duplicate key), continuing...');
                } else {
                  console.error('Manual profile creation failed:', profileError);
                  throw profileError;
                }
              } else {
                console.log('Profile created manually');
              }
            } else {
              console.log('Profile already exists');
            }
          } catch (profileError: any) {
            // Only show error if it's not a duplicate key issue
            if (!profileError.message?.includes('duplicate key')) {
              console.error('Profile creation error:', profileError);
              toast({
                title: "Profile Creation Failed", 
                description: `Account created but profile setup failed: ${profileError.message}. Please contact support.`,
                variant: "destructive",
              });
              return;
            } else {
              console.log('Profile creation skipped - already exists');
            }
          }

          // If doctor signup, create doctor profile
          if (isDoctorSignup) {
            try {
              // Wait a bit for profile to be available
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              console.log('Creating doctor profile for user:', user.id);
              
              // Create basic doctor profile with only required fields
              const { error: doctorError } = await supabase
                .from('doctors')
                .insert({
                  profile_id: user.id,
                  specialization: formData.specialization,
                  license_number: formData.licenseNumber,
                  experience_years: parseInt(formData.experienceYears),
                  consultation_fee: parseFloat(formData.consultationFee),
                  is_available: true
                });

              if (doctorError) {
                console.error('Error creating basic doctor profile:', doctorError);
                throw doctorError;
              }

              // Try to update with optional fields
              try {
                const updateData: any = {};
                if (formData.bio) updateData.bio = formData.bio;
                if (formData.education) updateData.education = [formData.education];
                if (formData.certifications) updateData.certifications = [formData.certifications];
                if (formData.languages) updateData.languages = [formData.languages];

                if (Object.keys(updateData).length > 0) {
                  const { error: updateError } = await supabase
                    .from('doctors')
                    .update(updateData)
                    .eq('profile_id', user.id);

                  if (updateError) {
                    console.warn('Warning: Could not update optional doctor fields:', updateError);
                    // Don't throw here, basic profile is created
                  }
                }
              } catch (updateError) {
                console.warn('Warning: Could not update optional doctor fields:', updateError);
                // Continue, basic profile is still created
              }

              if (doctorError) {
                console.error('Error creating doctor profile:', doctorError);
                toast({
                  title: "Doctor Profile Creation Failed",
                  description: `Account created but doctor profile setup failed: ${doctorError.message}. Please contact support.`,
                  variant: "destructive",
                });
              } else {
                console.log('Doctor profile created successfully');
                toast({
                  title: "Doctor Account Created!",
                  description: "Please check your email to confirm your account. Your doctor profile has been set up.",
                });
              }
            } catch (doctorError: any) {
              console.error('Doctor profile creation error:', doctorError);
              toast({
                title: "Doctor Profile Creation Failed",
                description: `Account created but doctor profile setup failed: ${doctorError.message}. Please contact support.`,
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Account Created!",
              description: "Please check your email to verify your account.",
            });
          }
          
          onSuccess?.();
        }
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Sign In Failed" : "Sign Up Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {showForgotPassword 
            ? 'Reset Password' 
            : (isLogin ? 'Welcome Back' : 'Create Account')
          }
        </CardTitle>
        <CardDescription className="text-center">
          {showForgotPassword 
            ? 'Enter your email to receive password reset instructions'
            : (isLogin 
              ? 'Sign in to your account to continue' 
              : 'Create a new account to get started'
            )
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !showForgotPassword && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Doctor Signup Toggle */}
              <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                <Switch
                  id="doctor-signup"
                  checked={isDoctorSignup}
                  onCheckedChange={setIsDoctorSignup}
                />
                <Label htmlFor="doctor-signup" className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>I am a doctor</span>
                </Label>
              </div>

              {/* Doctor-specific fields */}
              {isDoctorSignup && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Doctor Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select value={formData.specialization} onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}>
                        <SelectTrigger className={errors.specialization ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="gynecology">Gynecology</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="general_practice">General Practice</SelectItem>
                          <SelectItem value="emergency_medicine">Emergency Medicine</SelectItem>
                          <SelectItem value="internal_medicine">Internal Medicine</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.specialization && (
                        <p className="text-sm text-destructive">{errors.specialization}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Medical License Number *</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        placeholder="Enter license number"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className={errors.licenseNumber ? 'border-destructive' : ''}
                      />
                      {errors.licenseNumber && (
                        <p className="text-sm text-destructive">{errors.licenseNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Years of Experience *</Label>
                      <Input
                        id="experienceYears"
                        name="experienceYears"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g., 5"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        className={errors.experienceYears ? 'border-destructive' : ''}
                      />
                      {errors.experienceYears && (
                        <p className="text-sm text-destructive">{errors.experienceYears}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">Consultation Fee ($) *</Label>
                      <Input
                        id="consultationFee"
                        name="consultationFee"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 150.00"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        className={errors.consultationFee ? 'border-destructive' : ''}
                      />
                      {errors.consultationFee && (
                        <p className="text-sm text-destructive">{errors.consultationFee}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Brief description of your practice and expertise"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Input
                        id="education"
                        name="education"
                        type="text"
                        placeholder="e.g., MD from Harvard Medical School"
                        value={formData.education}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Input
                        id="certifications"
                        name="certifications"
                        type="text"
                        placeholder="e.g., Board Certified in Cardiology"
                        value={formData.certifications}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input
                      id="languages"
                      name="languages"
                      type="text"
                      placeholder="e.g., English, Spanish"
                      value={formData.languages}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {!showForgotPassword && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
            </>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (
              showForgotPassword ? 'Send Reset Email' : 
              (isLogin ? 'Sign In' : 'Create Account')
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          {!showForgotPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                resetFormData();
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setErrors({});
                resetFormData();
              }}
              className="text-sm text-primary hover:underline"
            >
              Back to sign in
            </button>
          )}
        </div>

        {isLogin && !showForgotPassword && (
          <div className="mt-2 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
              onClick={() => {
                setShowForgotPassword(true);
                setErrors({});
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
