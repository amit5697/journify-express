
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, startOfWeek } from 'date-fns';
import { useDietStore, WeeklyPlan } from '@/utils/dietStore';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WeeklyPlanner: React.FC = () => {
  const { weeklyPlans, addWeeklyPlan, updateWeeklyPlan, meals } = useDietStore();
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date()));
  const [weekPlan, setWeekPlan] = useState<WeeklyPlan | null>(null);
  
  // Initialize the week's plan data
  useEffect(() => {
    const weekStartDate = format(currentWeek, 'yyyy-MM-dd');
    const existingPlan = weeklyPlans.find((plan) => plan.weekStart === weekStartDate);
    
    if (existingPlan) {
      setWeekPlan(existingPlan);
    } else {
      // Create a new empty plan for the week
      const days: WeeklyPlan['days'] = {};
      for (let i = 0; i < 7; i++) {
        const day = format(addDays(currentWeek, i), 'yyyy-MM-dd');
        days[day] = {};
      }
      
      const newPlan: Omit<WeeklyPlan, 'id'> = {
        weekStart: weekStartDate,
        days,
      };
      
      const newPlanId = addWeeklyPlan(newPlan);
      setWeekPlan({
        id: newPlanId,
        ...newPlan
      });
    }
  }, [currentWeek, weeklyPlans, addWeeklyPlan]);
  
  // Navigate to previous/next week
  const goToPrevWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };
  
  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };
  
  // Update meal in plan
  const updateMealInPlan = (date: string, mealType: string, mealId: string) => {
    if (!weekPlan) return;
    
    const updatedDays = { ...weekPlan.days };
    if (!updatedDays[date]) {
      updatedDays[date] = {};
    }
    
    // Update the specific meal type
    if (mealType === 'snack') {
      updatedDays[date].snacks = [mealId]; // For simplicity, just one snack
    } else {
      updatedDays[date] = {
        ...updatedDays[date],
        [mealType]: mealId,
      };
    }
    
    const updatedPlan = {
      ...weekPlan,
      days: updatedDays
    };
    
    updateWeeklyPlan(weekPlan.id, {
      days: updatedDays,
    });
    
    setWeekPlan(updatedPlan);
    toast.success('Meal plan updated');
  };
  
  // Update notes for a day
  const updateNotes = (date: string, notes: string) => {
    if (!weekPlan) return;
    
    const updatedDays = { ...weekPlan.days };
    if (!updatedDays[date]) {
      updatedDays[date] = {};
    }
    
    updatedDays[date].notes = notes;
    
    const updatedPlan = {
      ...weekPlan,
      days: updatedDays
    };
    
    updateWeeklyPlan(weekPlan.id, {
      days: updatedDays,
    });
    
    setWeekPlan(updatedPlan);
  };
  
  // Get meal name by ID
  const getMealNameById = (mealId?: string) => {
    if (!mealId) return '';
    return meals.find(meal => meal.id === mealId)?.name || '';
  };
  
  // Prepare the days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEEE');
    const dayNumber = format(date, 'd');
    const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
    
    return {
      date: dateStr,
      dayName,
      dayNumber,
      isToday,
    };
  });
  
  if (!weekPlan) {
    return <div className="p-8 text-center">Loading weekly plan...</div>;
  }
  
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
                          <SelectValue placeholder={`Add ${mealType}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {meals
                            .filter(meal => meal.type === mealType)
                            .map(meal => (
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
                          // This would typically open a form to add a meal directly
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
