
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDietStore } from '@/utils/dietStore';
import DietPlannerHeader from '@/components/DietPlannerHeader';
import MealForm from '@/components/MealForm';
import MealList from '@/components/MealList';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import { CalendarDays, Plus, Utensils } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const DietPlanner: React.FC = () => {
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const { meals } = useDietStore();
  
  const handleAddMealClick = () => {
    setIsAddingMeal(true);
  };
  
  const handleMealFormClose = () => {
    setIsAddingMeal(false);
  };
  
  return (
    <>
      <Helmet>
        <title>Diet Planner - Plan Your Meals and Track Nutrition</title>
        <meta name="description" content="Plan your daily meals, track your nutrition patterns, and maintain a healthy diet with our comprehensive diet planner." />
        <meta property="og:title" content="Diet Planner - Meal Planning Tool" />
        <meta property="og:description" content="Plan and track your meals to maintain a healthy diet and understand your nutrition patterns." />
        <meta property="og:image" content="/diet-planner-preview.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Diet Planner - Meal Planning Tool" />
        <meta property="twitter:description" content="Plan your meals and track nutrition with our easy-to-use diet planner." />
        <meta property="twitter:image" content="/diet-planner-preview.png" />
      </Helmet>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <DietPlannerHeader />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Diet Planner</h1>
                
                {!isAddingMeal && (
                  <Button 
                    onClick={handleAddMealClick} 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Meal
                  </Button>
                )}
              </div>
              
              {isAddingMeal ? (
                <Card className="mb-8 border border-primary/20">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl">Add New Meal</CardTitle>
                    <CardDescription>Record what you eat to track your nutrition</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <MealForm onCancel={handleMealFormClose} onSave={handleMealFormClose} />
                  </CardContent>
                </Card>
              ) : null}
              
              <Tabs defaultValue="meals" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                  <TabsTrigger value="meals" className="gap-2">
                    <Utensils className="h-4 w-4" />
                    Today's Meals
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Weekly Plan
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="meals" className="mt-0">
                  {meals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20">
                      <Utensils className="h-12 w-12 text-muted mb-4" />
                      <h3 className="text-xl font-medium mb-2">No meals recorded yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Start tracking your nutrition by adding meals to your daily plan
                      </p>
                      <Button onClick={handleAddMealClick}>Add Your First Meal</Button>
                    </div>
                  ) : (
                    <MealList />
                  )}
                </TabsContent>
                
                <TabsContent value="weekly" className="mt-0">
                  <WeeklyPlanner />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DietPlanner;
