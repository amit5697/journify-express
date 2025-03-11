
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import JournalForm from '@/components/JournalForm';
import { useJournalStore } from '@/utils/journalStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Journal: React.FC = () => {
  const { activeEntryId, setActiveEntry } = useJournalStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const isMobile = useIsMobile();
  
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        onNewEntry={handleNewEntry} 
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6">
          <h1 className="text-xl font-medium">Daily Journal</h1>
          
          {!sidebarExpanded && (
            <Button 
              onClick={handleNewEntry}
              className="button-hover"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          )}
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
  );
};

export default Journal;
