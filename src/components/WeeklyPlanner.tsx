
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Meal {
  id: string;
  date: string;
  type: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  user_id: string;
}

interface WeeklyPlan {
  id?: string;
  weekStart: string;
  days: {
    [date: string]: {
      breakfast?: string; // Meal ID
      lunch?: string;
      dinner?: string;
      snacks?: string[];
      notes?: string;
    };
  };
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const WeeklyPlanner: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date()));
  const [weekPlan, setWeekPlan] = useState<WeeklyPlan | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch meals
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching meals:', error);
        } else if (data) {
          // Convert the data to ensure type property is a valid MealType
          const typedMeals = data.map(meal => ({
            ...meal,
            type: meal.type as MealType
          }));
          setMeals(typedMeals);
        }
      } catch (error) {
        console.error('Error in fetchMeals:', error);
      }
    };
    
    fetchMeals();
    
    // Set up real-time subscription for meals
    const subscription = supabase
      .channel('meal_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meals' 
      }, () => {
        fetchMeals();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  // Initialize the week's plan data
  useEffect(() => {
    setLoading(true);
    const weekStartDate = format(currentWeek, 'yyyy-MM-dd');
    
    // Create a new empty plan for the week
    const days: Record<string, any> = {};
    for (let i = 0; i < 7; i++) {
      const day = format(addDays(currentWeek, i), 'yyyy-MM-dd');
      days[day] = {};
    }
    
    const newPlan: WeeklyPlan = {
      weekStart: weekStartDate,
      days,
    };
    
    setWeekPlan(newPlan);
    setLoading(false);
  }, [currentWeek]);
  
  const goToPrevWeek = () => setCurrentWeek(prev => addDays(prev, -7));
  const goToNextWeek = () => setCurrentWeek(prev => addDays(prev, 7));
  
  const updateMealInPlan = (date: string, mealType: string, mealId: string) => {
    if (!weekPlan) return;
    
    setWeekPlan(prevPlan => {
      if (!prevPlan) return null;
      
      const updatedDays = { ...prevPlan.days };
      if (!updatedDays[date]) {
        updatedDays[date] = {};
      }
      
      if (mealType === 'snack') {
        updatedDays[date].snacks = mealId ? [mealId] : [];
      } else {
        updatedDays[date] = {
          ...updatedDays[date],
          [mealType]: mealId || undefined,
        };
      }
      
      return {
        ...prevPlan,
        days: updatedDays,
      };
    });
    
    toast.success('Meal plan updated');
  };
  
  const updateNotes = (date: string, notes: string) => {
    if (!weekPlan) return;
    
    setWeekPlan(prevPlan => {
      if (!prevPlan) return null;
      
      const updatedDays = { ...prevPlan.days };
      if (!updatedDays[date]) {
        updatedDays[date] = {};
      }
      
      updatedDays[date].notes = notes;
      
      return {
        ...prevPlan,
        days: updatedDays,
      };
    });
  };
  
  if (loading || !weekPlan) {
    return <div className="p-8 text-center">Loading weekly plan...</div>;
  }
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEEE'),
      dayNumber: format(date, 'd'),
      isToday: format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
    };
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={goToPrevWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Week
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-medium">
            {format(currentWeek, 'MMMM d')} - {format(addDays(currentWeek, 6), 'MMMM d, yyyy')}
          </h3>
        </div>
        
        <Button variant="outline" onClick={goToNextWeek}>
          Next Week
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weekDays.map((day) => (
          <Card key={day.date} className={`overflow-hidden ${day.isToday ? 'border-primary' : ''}`}>
            <CardHeader className={`py-3 ${day.isToday ? 'bg-primary/10' : 'bg-muted/30'}`}>
              <CardTitle className="text-base font-medium flex justify-between items-center">
                <span>{day.dayName}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${day.isToday ? 'bg-primary text-white' : 'bg-muted'}`}>
                  {day.dayNumber}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {mealTypes.map((mealType) => {
                const mealId = mealType === 'snack'
                  ? weekPlan.days[day.date]?.snacks?.[0] || ''
                  : weekPlan.days[day.date]?.[mealType] || '';
                
                const filteredMeals = meals.filter(meal => meal.type === mealType);
                
                return (
                  <div key={mealType} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </p>
                    
                    <div className="flex gap-2 items-center">
                      <Select
                        value={mealId}
                        onValueChange={(value) => updateMealInPlan(day.date, mealType, value)}
                      >
                        <SelectTrigger className="w-full h-8 text-sm">
                          <SelectValue placeholder={`Add ${mealType}`}>
                            {mealId ? meals.find(m => m.id === mealId)?.name : `Add ${mealType}`}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {filteredMeals.map(meal => (
                            <SelectItem key={meal.id} value={meal.id}>
                              {meal.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => {
                          toast.info('Use the Add Meal button at the top to create new meals');
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              <div className="space-y-1 pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Notes</p>
                <Textarea
                  value={weekPlan.days[day.date]?.notes || ''}
                  onChange={(e) => updateNotes(day.date, e.target.value)}
                  placeholder="Add notes for this day..."
                  className="h-20 text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
