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
  
  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      default: return 'Sign In';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return 'Create your account to get started';
      case 'forgot': return 'Enter your email to receive reset instructions';
      default: return 'Enter your credentials to access your account';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : getTitle()}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <Button
                variant="link"
                className="text-sm"
                onClick={() => switchMode('forgot')}
              >
                Forgot your password?
              </Button>
              <div>
                <span className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                </span>
                <Button
                  variant="link"
                  className="text-sm p-0"
                  onClick={() => switchMode('signup')}
                >
                  Sign up
                </Button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div>
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
              </span>
              <Button
                variant="link"
                className="text-sm p-0"
                onClick={() => switchMode('signin')}
              >
                Sign in
              </Button>
            </div>
          )}

          {mode === 'forgot' && (
            <Button
              variant="link"
              className="text-sm"
              onClick={() => switchMode('signin')}
            >
              Back to sign in
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};