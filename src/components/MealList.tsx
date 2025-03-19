import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Coffee, Utensils, Pizza, Cookie } from 'lucide-react';
import MealForm from './MealForm';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

const mealTypeIcons = {
  breakfast: <Coffee className="h-4 w-4" />,
  lunch: <Utensils className="h-4 w-4" />,
  dinner: <Pizza className="h-4 w-4" />,
  snack: <Cookie className="h-4 w-4" />,
};

const mealTypeColors = {
  breakfast: 'bg-blue-50 text-blue-700 border-blue-200',
  lunch: 'bg-green-50 text-green-700 border-green-200',
  dinner: 'bg-purple-50 text-purple-700 border-purple-200',
  snack: 'bg-amber-50 text-amber-700 border-amber-200',
};

const MealList: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching meals:', error);
          toast.error('Failed to load meals');
        } else {
          setMeals(data || []);
        }
      } catch (error) {
        console.error('Error in fetchMeals:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeals();
    
    const subscription = supabase
      .channel('meal_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meals' 
      }, (payload) => {
        fetchMeals();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);
      
      if (error) {
        toast.error('Failed to delete meal');
        console.error(error);
      } else {
        toast.success('Meal deleted successfully');
        setMeals(prevMeals => prevMeals.filter(m => m.id !== mealId));
      }
    } catch (error) {
      console.error('Error in handleDeleteMeal:', error);
    }
  };
  
  const mealsByDate = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const date = meal.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(mealsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  return (
    <div className="space-y-8">
      {editingMealId && (
        <Card className="mb-8 border border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-xl">Edit Meal</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <MealForm 
              mealId={editingMealId} 
              onSave={() => setEditingMealId(null)} 
              onCancel={() => setEditingMealId(null)} 
            />
          </CardContent>
        </Card>
      )}
      
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          <h3 className="font-medium text-lg flex items-center gap-2">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            {date === new Date().toISOString().split('T')[0] && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                Today
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealsByDate[date]
              .sort((a, b) => {
                const typeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
                return typeOrder[a.type] - typeOrder[b.type];
              })
              .map((meal) => (
                <Card key={meal.id} className="overflow-hidden">
                  <CardHeader className={`py-3 px-4 flex flex-row items-center justify-between ${mealTypeColors[meal.type]} border-b`}>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      {mealTypeIcons[meal.type]}
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </CardTitle>
                    <span className="text-sm font-medium">{meal.calories} cal</span>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <h4 className="font-medium text-lg mb-3">{meal.name}</h4>
                    
                    {meal.notes && (
                      <p className="text-muted-foreground text-sm mb-4">{meal.notes}</p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/30 px-3 py-2 rounded">
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="font-medium">{meal.protein}g</p>
                      </div>
                      <div className="bg-muted/30 px-3 py-2 rounded">
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="font-medium">{meal.carbs}g</p>
                      </div>
                      <div className="bg-muted/30 px-3 py-2 rounded">
                        <p className="text-xs text-muted-foreground">Fat</p>
                        <p className="font-medium">{meal.fat}g</p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-4 py-2 flex justify-end gap-2 bg-muted/10">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingMealId(meal.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this meal entry. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMeal(meal.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      ))}
      
      {sortedDates.length === 0 && (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No meals recorded yet</p>
        </div>
      )}
    </div>
  );
};

export default MealList;
