import React from 'react';
import { useStore } from '../store/useStore';
import { useClockTime, useFestivalDay } from '../hooks/useCurrentTime';

export const Header: React.FC = () => {
  const time = useClockTime();
  const festivalDay = useFestivalDay();
  const { selectedDayFilter, activeDay } = useStore();
  const viewDay = selectedDayFilter !== 0 ? selectedDayFilter : activeDay;

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-lg border-b border-rule/50 px-4 sm:px-6 h-12 flex items-center">
      <div className="flex items-center justify-between">
        <span className="text-lg sm:text-2xl font-display font-bold tracking-tight text-ink">
          CLUJPULSE
        </span>

        <div className="flex items-center gap-3">
          {festivalDay ? (
            <span className="text-[11px] font-mono text-success tracking-wide uppercase hidden sm:inline">
              Live · Day {festivalDay}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-ink-2 tracking-wide uppercase hidden sm:inline">
              Day {viewDay}
            </span>
          )}
          <span className="text-xl sm:text-2xl font-display font-bold text-ink tabular-nums">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
