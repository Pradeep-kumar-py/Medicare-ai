import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-secondary">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Medcare AI
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered healthcare assistant
          </p>
        </div>
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
};

export default AuthPage;
