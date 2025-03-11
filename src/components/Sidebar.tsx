
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useJournalStore } from '@/utils/journalStore';
import JournalEntry from './JournalEntry';
import { PlusCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  onNewEntry: () => void;
  expanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewEntry, expanded, onToggle }) => {
  const { entries, activeEntryId, setActiveEntry } = useJournalStore();
  const isMobile = useIsMobile();
  
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
                {entries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <JournalEntry
                      key={entry.id}
                      entry={entry}
                      isActive={entry.id === activeEntryId}
                      onClick={() => setActiveEntry(entry.id)}
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
