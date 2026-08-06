import React from 'react';
import { useClockTime, useFestivalDay } from '../hooks/useCurrentTime';

export const Header: React.FC = () => {
  const time = useClockTime();
  const festivalDay = useFestivalDay();

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-rule/50 px-5 h-12 flex items-center justify-between">
      <span className="text-lg font-display font-bold tracking-tight text-ink">
        CLUJPULSE
      </span>

      <div className="flex items-center gap-2">
        {festivalDay && (
          <span className="text-[11px] font-mono text-success tracking-wide">
            LIVE · DAY {festivalDay}
          </span>
        )}
        <span className="text-lg font-display font-bold text-ink tabular-nums">
          {time}
        </span>
      </div>
    </header>
  );
};
