
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDietStore, MealType } from '@/utils/dietStore';
import { toast } from 'sonner';

interface MealFormProps {
  mealId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const MealForm: React.FC<MealFormProps> = ({ mealId, onSave, onCancel }) => {
  const { addMeal, updateMeal, getMealById } = useDietStore();
  const existingMeal = mealId ? getMealById(mealId) : undefined;
  
  const [formData, setFormData] = useState({
    type: existingMeal?.type || 'breakfast' as MealType,
    name: existingMeal?.name || '',
    calories: existingMeal?.calories || 0,
    protein: existingMeal?.protein || 0,
    carbs: existingMeal?.carbs || 0,
    fat: existingMeal?.fat || 0,
    notes: existingMeal?.notes || '',
    date: existingMeal?.date || new Date().toISOString().split('T')[0],
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : name === 'date' ? value : Number(value) || 0,
    }));
  };
  
  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value as MealType,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a meal name');
      return;
    }
    
    if (mealId) {
      updateMeal(mealId, formData);
      toast.success('Meal updated successfully');
    } else {
      addMeal(formData);
      toast.success('Meal added successfully');
    }
    
    onSave();
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
        <Button type="submit">
          {mealId ? 'Update Meal' : 'Add Meal'}
        </Button>
      </div>
    </form>
  );
};

export default MealForm;
