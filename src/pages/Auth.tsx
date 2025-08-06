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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <main className="flex-grow flex items-center justify-center w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground">Sign in to access your projects</p>
          </div>
          <AuthForms onSuccess={handleAuthSuccess} />
        </div>
      </main>
      <footer className="w-full bg-card border-t">
        <div className="container mx-auto px-6 py-4 text-center text-muted-foreground">
          <p>Designed by Amla Commerce</p>
        </div>
      </footer>
    </div>
  );
};