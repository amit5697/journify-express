
import React from 'react';
import { cn } from '@/lib/utils';

interface RatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  max = 10,
  label,
}) => {
  const options = Array.from({ length: max }, (_, i) => i + 1);
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">{label}</label>
          <span className="text-sm font-medium text-muted-foreground">{value}/{max}</span>
        </div>
      )}
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "relative flex-1 h-12 rounded-md border transition-all duration-300 button-hover",
              option <= value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-muted/50 hover:bg-muted/50"
            )}
            aria-selected={option === value}
          >
            <span className="absolute inset-0 flex items-center justify-center">
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingSelector;
