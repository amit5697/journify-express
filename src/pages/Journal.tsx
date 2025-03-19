
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import JournalForm from '@/components/JournalForm';
import { useJournalStore } from '@/utils/journalStore';
import { Button } from '@/components/ui/button';
import { Plus, Utensils } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LogoutButton from '@/components/LogoutButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JournalEntry from '@/components/JournalEntry';

interface JournalEntryType {
  id: string;
  date: string;
  content: string;
  energy: number;
  productivity: number;
}

const Journal: React.FC = () => {
  const { activeEntryId, setActiveEntry } = useJournalStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    } else {
      setSidebarExpanded(true);
    }
  }, [isMobile]);
  
  // Fetch journal entries from Supabase
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signin');
        return;
      }
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching journal entries:', error);
        toast.error('Failed to load journal entries');
      } else {
        setEntries(data || []);
      }
      
      setIsLoading(false);
    };
    
    fetchEntries();
    
    // Set up real-time subscription for journal entries
    const channel = supabase
      .channel('journal_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries'
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);
  
  const handleNewEntry = () => {
    setActiveEntry(null);
  };
  
  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };
  
  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      
      // If the deleted entry was active, reset activeEntryId
      if (activeEntryId === id) {
        setActiveEntry(null);
      }
    }
  };
  
  const handleEntryRefresh = () => {
    // This function will be called after saving an entry
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error refreshing entries:', error);
      } else {
        setEntries(data || []);
      }
    };
    
    fetchEntries();
  };
  
  return (
    <>
      <Helmet>
        <title>Daily Journal - Track Your Thoughts and Energy</title>
        <meta name="description" content="Record your daily experiences, track energy levels, and monitor productivity with our beautiful journaling tool." />
        <meta property="og:title" content="Daily Journal - Personal Journaling App" />
        <meta property="og:description" content="A simple, elegant journal to record thoughts, track energy levels, and measure productivity." />
        <meta property="og:image" content="/journal-preview.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Daily Journal - Track Your Thoughts" />
        <meta property="twitter:description" content="Record daily experiences and monitor energy levels with our journal app." />
        <meta property="twitter:image" content="/journal-preview.png" />
      </Helmet>
      <div className="flex h-screen overflow-hidden bg-background">
        <aside className={`w-72 border-r border-border transition-all duration-300 overflow-hidden ${sidebarExpanded ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Your Journal</h2>
              <Button 
                onClick={handleNewEntry}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Entry
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : entries.length > 0 ? (
                entries.map(entry => (
                  <JournalEntry
                    key={entry.id}
                    entry={entry}
                    isActive={activeEntryId === entry.id}
                    onClick={() => setActiveEntry(entry.id)}
                    onDelete={handleDeleteEntry}
                  />
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No journal entries yet. Create your first entry!
                </div>
              )}
            </div>
          </div>
        </aside>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b flex items-center justify-between px-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="md:hidden mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              </Button>
              <h1 className="text-xl font-medium">Daily Journal</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {!sidebarExpanded && (
                <Button 
                  onClick={handleNewEntry}
                  className="button-hover"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Entry
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate('/diet-planner')}
                className="flex items-center gap-2"
              >
                <Utensils className="h-4 w-4" />
                Diet Planner
              </Button>
              
              <LogoutButton />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto h-full">
              <JournalForm 
                entryId={activeEntryId || undefined} 
                onSave={handleEntryRefresh}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Journal;
