
import React from 'react';
import { format } from 'date-fns';
import { JournalEntry as JournalEntryType } from '@/utils/journalStore';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface JournalEntryProps {
  entry: JournalEntryType;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, isActive, onClick, onDelete }) => {
  // Format the date
  const formattedDate = format(new Date(entry.date), 'MMMM d, yyyy');
  
  // Create a preview of the content (first 50 characters)
  const contentPreview = entry.content.length > 50 
    ? `${entry.content.substring(0, 50)}...` 
    : entry.content;
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(entry.id);
  };
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-300 mb-3 animate-in relative group",
        isActive 
          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
          : "bg-card hover:bg-accent/50 border border-border"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("font-medium", isActive ? "text-primary-foreground" : "text-foreground")}>{formattedDate}</h3>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2",
            isActive ? "text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary/80" : "text-destructive hover:text-destructive hover:bg-destructive/10"
          )}
          onClick={handleDelete}
          title="Delete entry"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className={cn(
        "text-sm line-clamp-2", 
        isActive ? "text-primary-foreground/90" : "text-muted-foreground"
      )}>
        {contentPreview}
      </p>
      <div className="flex mt-2 gap-4">
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-xs", 
            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            Energy:
          </span>
          <span className={cn(
            "font-medium text-xs", 
            isActive ? "text-primary-foreground" : "text-foreground"
          )}>
            {entry.energy}/10
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-xs", 
            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            Productivity:
          </span>
          <span className={cn(
            "font-medium text-xs", 
            isActive ? "text-primary-foreground" : "text-foreground"
          )}>
            {entry.productivity}/10
          </span>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;
