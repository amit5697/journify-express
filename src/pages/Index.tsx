
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2, Star, Utensils, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Daily Journal - Track Your Thoughts and Energy</title>
        <meta name="description" content="A simple, beautiful journal to record your thoughts, track your energy levels, and measure productivity." />
        <meta property="og:title" content="Daily Journal - Personal Journaling App" />
        <meta property="og:description" content="Record daily experiences and monitor energy levels with our journal app." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <header className="border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-medium">Daily Journal</h1>
          </div>
          <Button 
            onClick={() => navigate('/signin')}
            variant="outline"
            className="button-hover gap-2"
          >
            Sign In
            <LogIn className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-6 py-12 md:py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Your Personal Journal</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Track your daily journey with clarity and insight
            </h1>
            
            <p className="text-xl text-muted-foreground">
              A simple, beautiful journal to record your thoughts, track your energy levels, and measure productivity.
            </p>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/signin')}
                size="lg"
                className="button-hover gap-2 text-base"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="button-hover"
                onClick={() => navigate('/signin')}
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Add a real image instead of the placeholder */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/10 backdrop-blur-xl z-0 animate-pulse-subtle"></div>
            
            <div className="aspect-square rounded-2xl overflow-hidden border border-border shadow-xl animate-in relative">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80" 
                alt="Journal and laptop" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-0"></div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-primary/10 backdrop-blur-xl z-0"></div>
          </div>
        </div>
        
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent">
              Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple yet powerful journaling tool designed with elegance and functionality in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Track Your Days",
                description: "Record your daily experiences, thoughts, and feelings in a clean, distraction-free environment.",
                icon: <BookOpen className="h-6 w-6 text-primary" />,
                image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80"
              },
              {
                title: "Energy Levels",
                description: "Monitor your energy levels over time to identify patterns and optimize your daily routine.",
                icon: <Star className="h-6 w-6 text-primary" />,
                image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80"
              },
              {
                title: "Diet Planning",
                description: "Plan and track your meals to maintain a healthy diet and understand your nutrition patterns.",
                icon: <Utensils className="h-6 w-6 text-primary" />,
                image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="rounded-xl border p-0 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="bg-muted/20 py-12 border-t mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary/80" />
            <h2 className="text-2xl font-medium">Daily Journal</h2>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Start your journaling practice today and gain valuable insights into your daily life.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/signin')}
              size="lg"
              className="button-hover gap-2"
            >
              Start Journaling
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => navigate('/signin')}
              variant="outline"
              size="lg"
              className="button-hover gap-2"
            >
              Try Diet Planner
              <Utensils className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Daily Journal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
