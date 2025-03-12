
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft } from 'lucide-react';

const DietPlannerHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="h-16 border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/journal')}
          className="mr-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-medium">Diet Planner</h1>
        </div>
      </div>
      
      <Button 
        variant="outline"
        onClick={() => navigate('/')}
      >
        Home
      </Button>
    </header>
  );
};

export default DietPlannerHeader;
