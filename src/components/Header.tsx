import React from 'react';
import { useStore } from '../store/useStore';
import { useClockTime } from '../hooks/useCurrentTime';

export const Header: React.FC = () => {
  const time = useClockTime();
  const { selectedDayFilter, activeDay } = useStore();
  const day = selectedDayFilter !== 0 ? selectedDayFilter : activeDay;

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-lg border-b border-rule/50 px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-display font-bold tracking-tight text-ink">
            CLUJPULSE
          </span>
          <span className="text-xs font-mono text-accent tracking-wide">
            UNTOLD '26
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-xs font-display font-bold text-ink-2 uppercase tracking-wide">
            Day {day}
          </span>
          <span className="text-2xl font-display font-bold text-ink tracking-tight tabular-nums">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
