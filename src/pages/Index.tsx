
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-medium">Daily Journal</h1>
          </div>
          <Button 
            onClick={() => navigate('/journal')}
            variant="outline"
            className="button-hover"
          >
            Sign In
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-6 py-12 md:py-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Track your daily journey with clarity and insight
            </h1>
            <p className="text-xl text-muted-foreground">
              A simple, beautiful journal to record your thoughts, track your energy levels, and measure productivity.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/journal')}
                size="lg"
                className="button-hover"
              >
                Get Started
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="button-hover"
                onClick={() => navigate('/journal')}
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-muted/30 p-4 backdrop-blur overflow-hidden border border-border shadow-xl animate-in relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0"></div>
              <div className="relative z-10">
                <div className="w-full h-8 mb-4 rounded-lg bg-background animate-pulse-subtle"></div>
                <div className="space-y-3">
                  <div className="w-2/3 h-4 rounded-lg bg-background animate-pulse-subtle"></div>
                  <div className="w-full h-32 rounded-lg bg-background animate-pulse-subtle"></div>
                  <div className="w-1/2 h-4 rounded-lg bg-background animate-pulse-subtle"></div>
                  <div className="w-full h-12 rounded-lg bg-background animate-pulse-subtle"></div>
                  <div className="w-full h-12 rounded-lg bg-background animate-pulse-subtle"></div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/10 backdrop-blur-xl z-0"></div>
            <div className="absolute -top-6 -left-6 h-16 w-16 rounded-full bg-primary/10 backdrop-blur-xl z-0"></div>
          </div>
        </div>
        
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple yet powerful journaling tool designed with elegance and functionality in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Track Your Days",
                description: "Record your daily experiences, thoughts, and feelings in a clean, distraction-free environment."
              },
              {
                title: "Energy Levels",
                description: "Monitor your energy levels over time to identify patterns and optimize your daily routine."
              },
              {
                title: "Productivity Insights",
                description: "Measure your productivity to understand your most effective days and working conditions."
              }
            ].map((feature, index) => (
              <div key={index} className="rounded-xl border p-6 bg-card shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Daily Journal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
