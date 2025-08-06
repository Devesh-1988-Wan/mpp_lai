import React, { useEffect } from 'react';
import { AuthForms } from '@/components/auth/AuthForms';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate('/projects');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">Sign in to access your projects</p>
        </div>
        <AuthForms onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
};