import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthFormsProps {
  onSuccess?: () => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleApiError = (error: any) => {
    if (error.message.includes('Invalid login credentials')) {
      setError('Invalid email or password. Please try again.');
    } else if (error.message.includes('User already registered')) {
      setError('An account with this email already exists. Please sign in.');
    } else {
      setError(error.message || 'An unexpected error occurred.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password);
        if (error) {
          handleApiError(error);
        } else {
          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          });
          setMode('signin');
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          handleApiError(error);
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          });
          onSuccess?.();
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          handleApiError(error);
        } else {
          toast({
            title: "Reset email sent",
            description: "Please check your email for password reset instructions.",
          });
          setMode('signin');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please check the console for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    resetForm();
  };
  
  // ... (rest of the component JSX remains the same)
};