
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  date: string;
  type: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  createdAt: number;
}

export interface WeeklyPlan {
  id: string;
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

interface DietState {
  meals: Meal[];
  weeklyPlans: WeeklyPlan[];
  
  // Meal actions
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => string;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  getMealById: (id: string) => Meal | undefined;
  
  // Weekly plan actions
  addWeeklyPlan: (plan: Omit<WeeklyPlan, 'id'>) => string;
  updateWeeklyPlan: (id: string, plan: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (id: string) => void;
  getCurrentWeekPlan: () => WeeklyPlan | undefined;
}

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      meals: [],
      weeklyPlans: [],
      
      addMeal: (meal) => {
        const id = crypto.randomUUID();
        const newMeal = {
          ...meal,
          id,
          createdAt: Date.now(),
        };
        set((state) => ({
          meals: [newMeal, ...state.meals],
        }));
        return id;
      },
      
      updateMeal: (id, updatedMeal) => {
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id ? { ...meal, ...updatedMeal } : meal
          ),
        }));
      },
      
      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
      },
      
      getMealById: (id) => {
        return get().meals.find((meal) => meal.id === id);
      },
      
      addWeeklyPlan: (plan) => {
        const id = crypto.randomUUID();
        const newPlan = {
          ...plan,
          id,
        };
        set((state) => ({
          weeklyPlans: [newPlan, ...state.weeklyPlans],
        }));
        return id;
      },
      
      updateWeeklyPlan: (id, updatedPlan) => {
        set((state) => ({
          weeklyPlans: state.weeklyPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updatedPlan } : plan
          ),
        }));
      },
      
      deleteWeeklyPlan: (id) => {
        set((state) => ({
          weeklyPlans: state.weeklyPlans.filter((plan) => plan.id !== id),
        }));
      },
      
      getCurrentWeekPlan: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startDateStr = startOfWeek.toISOString().split('T')[0];
        
        return get().weeklyPlans.find((plan) => plan.weekStart === startDateStr);
      },
    }),
    {
      name: 'diet-planner-storage',
    }
  )
);
