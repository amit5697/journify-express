
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/journal');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    if (isSignUp) {
      // Handle sign up
      if (!name.trim()) {
        setError('Please enter your name');
        setIsLoading(false);
        return;
      }
      
      try {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            }
          }
        });
        
        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (!data.user) {
          setError("Signup failed: No user was created");
          setIsLoading(false);
          return;
        }
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        setIsSignUp(false);
      } catch (err) {
        console.error("Signup error:", err);
        setError("An unexpected error occurred during signup");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle sign in
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (!data.user) {
          setError("Login failed: User authentication failed");
          setIsLoading(false);
          return;
        }
        
        toast.success('Successfully signed in!');
        navigate('/journal');
      } catch (err) {
        console.error("Signin error:", err);
        setError("An unexpected error occurred during sign in");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/journal`,
        }
      });
      
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to initiate Google sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} - Daily Journal</title>
        <meta name="description" content={isSignUp ? 'Create an account to start your journal' : 'Sign in to Daily Journal to track your thoughts, energy levels, and productivity.'} />
        <meta property="og:title" content={`${isSignUp ? 'Sign Up' : 'Sign In'} - Daily Journal`} />
        <meta property="og:description" content="Access your personal journal and meal planning tools." />
        <meta property="og:image" content="/signin-preview.png" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b">
          <div className="container mx-auto py-4 px-6 flex items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-medium">Daily Journal</h1>
            </div>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp ? 'Enter your details to create your account' : 'Enter your details to access your journal'}
              </CardDescription>
            </CardHeader>
            
            {error && (
              <div className="px-6">
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Enter your name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')}
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Sign in with Google
                </Button>
                
                <div className="text-center text-sm">
                  {isSignUp ? (
                    <span>
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        className="text-primary hover:underline" 
                        onClick={() => setIsSignUp(false)}
                      >
                        Sign in
                      </button>
                    </span>
                  ) : (
                    <span>
                      Don't have an account?{' '}
                      <button 
                        type="button" 
                        className="text-primary hover:underline" 
                        onClick={() => setIsSignUp(true)}
                      >
                        Create one
                      </button>
                    </span>
                  )}
                </div>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </>
  );
};

export default SignIn;
