
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

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    if (isSignUp) {
      // Handle sign up
      if (!name.trim()) {
        toast.error('Please enter your name');
        setIsLoading(false);
        return;
      }
      
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
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      
      toast.success('Account created successfully! Please check your email to verify your account.');
      setIsSignUp(false);
    } else {
      // Handle sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      
      toast.success('Successfully signed in!');
      navigate('/journal');
    }
    
    setIsLoading(false);
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
                  className="w-full button-hover"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')}
                  <LogIn className="ml-2 h-4 w-4" />
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
