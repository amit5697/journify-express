
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

const Journal: React.FC = () => {
  const { activeEntryId, setActiveEntry } = useJournalStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
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
  
  const handleNewEntry = () => {
    setActiveEntry(null);
  };
  
  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
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
        <Sidebar 
          isOpen={sidebarExpanded}
          setIsOpen={setSidebarExpanded}
          onNewEntry={handleNewEntry} 
          expanded={sidebarExpanded}
          onToggle={toggleSidebar}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b flex items-center justify-between px-6">
            <h1 className="text-xl font-medium">Daily Journal</h1>
            
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
                onSave={() => {}}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Journal;
