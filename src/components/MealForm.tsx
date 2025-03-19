
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealFormProps {
  mealId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const MealForm: React.FC<MealFormProps> = ({ mealId, onSave, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'breakfast' as MealType,
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    getCurrentUser();
  }, []);
  
  useEffect(() => {
    const fetchMeal = async () => {
      if (mealId) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('id', mealId)
          .single();
        
        if (error) {
          toast.error('Error loading meal data');
          console.error(error);
        } else if (data) {
          setFormData({
            type: data.type as MealType,
            name: data.name,
            calories: data.calories || 0,
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fat || 0,
            notes: data.notes || '',
            date: data.date,
          });
        }
        setIsLoading(false);
      }
    };
    
    fetchMeal();
  }, [mealId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'name' || name === 'notes' || name === 'date') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value),
      }));
    }
  };
  
  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value as MealType,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a meal name');
      return;
    }
    
    if (!userId) {
      toast.error('You must be logged in to save meals');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (mealId) {
        const { error } = await supabase
          .from('meals')
          .update({
            type: formData.type,
            name: formData.name,
            calories: formData.calories,
            protein: formData.protein,
            carbs: formData.carbs,
            fat: formData.fat,
            notes: formData.notes,
            date: formData.date,
            updated_at: new Date().toISOString()
          })
          .eq('id', mealId);
        
        if (error) throw error;
        toast.success('Meal updated successfully');
      } else {
        const { error } = await supabase
          .from('meals')
          .insert({
            type: formData.type,
            name: formData.name,
            calories: formData.calories,
            protein: formData.protein,
            carbs: formData.carbs,
            fat: formData.fat,
            notes: formData.notes,
            date: formData.date,
            user_id: userId
          });
        
        if (error) throw error;
        toast.success('Meal added successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="type">Meal Type</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="name">Meal Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="What did you eat?"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details about this meal..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              name="calories"
              type="number"
              min="0"
              value={formData.calories}
              onChange={handleChange}
              placeholder="Calories"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                name="protein"
                type="number"
                min="0"
                value={formData.protein}
                onChange={handleChange}
                placeholder="Protein"
              />
            </div>
            
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                name="carbs"
                type="number"
                min="0"
                value={formData.carbs}
                onChange={handleChange}
                placeholder="Carbs"
              />
            </div>
            
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                name="fat"
                type="number"
                min="0"
                value={formData.fat}
                onChange={handleChange}
                placeholder="Fat"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !userId}>
          {mealId ? 'Update Meal' : 'Add Meal'}
        </Button>
      </div>
    </form>
  );
};

export default MealForm;
