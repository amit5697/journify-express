import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import JournalEntry from './JournalEntry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SidebarProps {
  onNewEntry: () => void;
  expanded: boolean;
  onToggle: () => void;
}

interface JournalEntryType {
  id: string;
  date: string;
  content: string;
  energy: number;
  productivity: number;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewEntry, expanded, onToggle }) => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching journal entries:', error);
          toast.error('Failed to load journal entries');
        } else {
          setEntries(data || []);
          
          if (data && data.length > 0 && !activeEntryId) {
            setActiveEntryId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error in fetchEntries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntries();
    
    const subscription = supabase
      .channel('journal_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'journal_entries' 
      }, (payload) => {
        fetchEntries();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    
    const lowerQuery = searchQuery.toLowerCase();
    return (
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.date.toLowerCase().includes(lowerQuery)
    );
  });

  const handleEntryClick = (entryId: string) => {
    setActiveEntryId(entryId);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', entryId);
        
        if (error) {
          toast.error('Failed to delete entry');
          console.error(error);
        } else {
          toast.success('Entry deleted successfully');
          
          if (entryId === activeEntryId && entries.length > 1) {
            const remainingEntries = entries.filter(e => e.id !== entryId);
            if (remainingEntries.length > 0) {
              setActiveEntryId(remainingEntries[0].id);
            } else {
              setActiveEntryId(null);
            }
          }
          
          setEntries(prevEntries => prevEntries.filter(e => e.id !== entryId));
        }
      } catch (error) {
        console.error('Error in handleDeleteEntry:', error);
      }
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full border-r border-border bg-sidebar transition-all duration-500 relative",
      expanded ? "w-80" : "w-0"
    )}>
      <div className="absolute top-4 -right-12 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onToggle}
          className="rounded-full shadow-md"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      
      {expanded && (
        <>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-medium">Journal Entries</h2>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {entries.length}
              </span>
            </div>
            
            <Button 
              onClick={onNewEntry} 
              className="w-full button-hover flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Entry</span>
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <BookOpen className="h-12 w-12 text-muted mb-4" />
                <p className="text-muted-foreground mb-2">No journal entries yet</p>
                <Button 
                  variant="link" 
                  onClick={onNewEntry}
                  className="text-primary"
                >
                  Create your first entry
                </Button>
              </div>
            ) : (
              <div>
                {filteredEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <JournalEntry
                      key={entry.id}
                      entry={entry}
                      isActive={entry.id === activeEntryId}
                      onClick={() => handleEntryClick(entry.id)}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default Sidebar;
