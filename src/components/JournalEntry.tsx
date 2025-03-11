
import React from 'react';
import { format } from 'date-fns';
import { JournalEntry as JournalEntryType } from '@/utils/journalStore';
import { cn } from '@/lib/utils';

interface JournalEntryProps {
  entry: JournalEntryType;
  isActive: boolean;
  onClick: () => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, isActive, onClick }) => {
  // Format the date
  const formattedDate = format(new Date(entry.date), 'MMMM d, yyyy');
  
  // Create a preview of the content (first 50 characters)
  const contentPreview = entry.content.length > 50 
    ? `${entry.content.substring(0, 50)}...` 
    : entry.content;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-300 mb-3 animate-in",
        isActive 
          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
          : "bg-card hover:bg-accent/50 border border-border"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("font-medium", isActive ? "text-primary-foreground" : "text-foreground")}>{formattedDate}</h3>
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
