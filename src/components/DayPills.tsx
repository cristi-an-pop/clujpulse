import React from 'react';

interface DayPillsProps {
  activeDay: number;
  onDayChange: (day: number) => void;
  showAll?: boolean;
}

export const DayPills: React.FC<DayPillsProps> = ({ activeDay, onDayChange, showAll }) => {
  return (
    <div className="flex items-center gap-1.5">
      {showAll && (
        <button
          onClick={() => onDayChange(0)}
          className={`px-3 py-2 rounded-full text-xs font-mono font-semibold tracking-wide uppercase transition-colors ${
            activeDay === 0 ? 'bg-ink text-paper' : 'text-ink'
          }`}
        >
          ALL
        </button>
      )}
      {[1, 2, 3, 4].map(day => (
        <button
          key={day}
          onClick={() => onDayChange(day)}
          className={`px-3 py-2 rounded-full text-xs font-mono font-semibold tracking-wide uppercase transition-colors ${
            activeDay === day ? 'bg-ink text-paper' : 'text-ink'
          }`}
        >
          DAY {day}
        </button>
      ))}
    </div>
  );
};
