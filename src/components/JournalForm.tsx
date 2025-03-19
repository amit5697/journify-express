
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import RatingSelector from './RatingSelector';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  energy: number;
  productivity: number;
}

interface JournalFormProps {
  entryId?: string;
  onSave?: () => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ entryId, onSave }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    date: today,
    content: '',
    energy: 5,
    productivity: 5
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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
  
  // If editing an existing entry, load its data
  useEffect(() => {
    const fetchEntry = async () => {
      if (entryId) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', entryId)
          .single();
        
        if (error) {
          toast.error('Error loading journal entry');
          console.error(error);
        } else if (data) {
          setEntry({
            id: data.id,
            date: data.date,
            content: data.content,
            energy: data.energy,
            productivity: data.productivity
          });
        }
        setIsLoading(false);
      } else {
        // Reset form if no entryId is provided (new entry)
        setEntry({
          date: today,
          content: '',
          energy: 5,
          productivity: 5
        });
      }
    };
    
    fetchEntry();
  }, [entryId, today]);
  
  const handleChange = (field: keyof JournalEntry, value: any) => {
    setEntry(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!entry.content) {
        toast.error("Please write something about your day");
        setIsLoading(false);
        return;
      }
      
      if (!userId) {
        toast.error("You must be logged in to save entries");
        setIsLoading(false);
        return;
      }
      
      if (entryId) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            date: entry.date,
            content: entry.content,
            energy: entry.energy,
            productivity: entry.productivity,
            updated_at: new Date().toISOString()
          })
          .eq('id', entryId);
        
        if (error) throw error;
        toast.success("Journal entry updated");
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            date: entry.date as string,
            content: entry.content as string,
            energy: entry.energy as number,
            productivity: entry.productivity as number,
            user_id: userId
          });
        
        if (error) throw error;
        toast.success("New journal entry created");
        
        // Reset form if it's a new entry
        setEntry({
          date: today,
          content: '',
          energy: 5,
          productivity: 5
        });
      }
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!entryId) return;
    
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      setIsLoading(true);
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) {
        console.error('Error deleting entry:', error);
        toast.error('Error deleting entry');
      } else {
        toast.success('Journal entry deleted');
        if (onSave) onSave();
      }
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full h-full overflow-hidden shadow-sm border animate-in">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-medium">
              {entryId ? 'Edit Journal Entry' : 'New Journal Entry'}
            </CardTitle>
            
            {entryId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Date</label>
            <input
              type="date"
              value={entry.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">How was your day?</label>
            <Textarea
              value={entry.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Write about your day..."
              className="form-input min-h-[150px] resize-none"
            />
          </div>
          
          <div className="space-y-4">
            <RatingSelector
              label="Energy Level"
              value={entry.energy || 5}
              onChange={(value) => handleChange('energy', value)}
            />
            
            <RatingSelector
              label="Productivity Level"
              value={entry.productivity || 5}
              onChange={(value) => handleChange('productivity', value)}
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-muted/10 py-4">
          <Button 
            type="submit" 
            className="w-full button-hover"
            disabled={isLoading || !userId}
          >
            {isLoading ? 'Saving...' : entryId ? 'Update Entry' : 'Save Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JournalForm;
