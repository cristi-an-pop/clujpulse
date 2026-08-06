import React, { useMemo, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import { useCurrentTime, useFestivalDay } from '../hooks/useCurrentTime';
import { timeToMinutes } from '../utils/clashDetection';
import { ArtistCard } from './ArtistCard';
import { StageSelector } from './StageSelector';
import { DayPills } from './DayPills';
import { Search, X } from 'lucide-react';

export const ArtistsView: React.FC = () => {
  const {
    searchQuery, setSearchQuery,
    selectedDayFilter, setSelectedDayFilter,
    selectedStageFilter, setSelectedStageFilter,
    favoriteIds
  } = useStore();

  const currentMinutes = useCurrentTime();
  const festivalDay = useFestivalDay();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredSets = useMemo(() => {
    return ARTIST_SETS.filter((set) => {
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameMatch = set.artistName.toLowerCase().includes(query);
        const genreMatch = set.genre?.toLowerCase().includes(query) || false;
        const stageMatch = STAGES.find(s => s.id === set.stageId)?.name.toLowerCase().includes(query) || false;
        if (!nameMatch && !genreMatch && !stageMatch) return false;
      }
      if (selectedDayFilter !== 0 && set.day !== selectedDayFilter) return false;
      if (selectedStageFilter !== 'all' && set.stageId !== selectedStageFilter) return false;
      return true;
    }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [searchQuery, selectedDayFilter, selectedStageFilter]);

  const playingNow = useMemo(() => {
    if (currentMinutes < 0 || !festivalDay) return [];
    return ARTIST_SETS.filter(s => {
      if (s.day !== festivalDay) return false;
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      return start <= currentMinutes && end > currentMinutes;
    });
  }, [festivalDay, currentMinutes]);

  const upNext = useMemo(() => {
    if (currentMinutes < 0 || !festivalDay) return [];
    return ARTIST_SETS.filter(s => {
      if (s.day !== festivalDay) return false;
      const start = timeToMinutes(s.startTime);
      const gap = start - currentMinutes;
      return gap > 0 && gap <= 30;
    }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [festivalDay, currentMinutes]);

  return (
    <div className="w-full pb-20">

      {/* Now playing */}
      {playingNow.length > 0 && (
        <div className="px-5 py-3 border-b border-accent/20 bg-accent-soft/50">
          <span className="text-[10px] font-mono text-accent tracking-widest uppercase">On stage now</span>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
            {playingNow.map(s => {
              const inLineup = favoriteIds.includes(s.id);
              return (
                <span key={s.id} className={`text-sm font-display font-semibold ${inLineup ? 'text-ink' : 'text-ink-2'}`}>
                  {inLineup && <span className="text-accent mr-0.5">✓</span>}
                  {s.artistName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Up next */}
      {upNext.length > 0 && (
        <div className="px-5 py-3 border-b border-ink-2/15 bg-paper-2/50">
          <span className="text-[10px] font-mono text-ink-2 tracking-widest uppercase">Starting in 30 min</span>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {upNext.map(s => {
              const stage = STAGES.find(st => st.id === s.stageId);
              const minsAway = timeToMinutes(s.startTime) - currentMinutes;
              const inLineup = favoriteIds.includes(s.id);
              return (
                <span key={s.id} className={`text-sm flex items-center gap-1.5 ${inLineup ? 'text-ink' : 'text-ink-2'}`}>
                  {inLineup && <span className="text-accent text-xs">✓</span>}
                  <span className="font-display font-semibold">{s.artistName}</span>
                  <span className="text-[11px] font-mono opacity-60">{minsAway}m</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage?.color }} />
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky bar — days + stage + search */}
      <div className="sticky top-0 z-40 bg-paper border-b border-ink/10 px-4 py-2 relative">
        {!searchExpanded ? (
          <div className="flex flex-col items-center gap-2">
            <DayPills
              activeDay={selectedDayFilter}
              onDayChange={(day) => setSelectedDayFilter(day)}
              showAll
            />

            <div className="flex items-center gap-3">
              <StageSelector />
              <button
                onClick={() => setSearchExpanded(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink bg-paper-2 border border-ink/20"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full py-3">
            <Search className="w-4 h-4 text-ink shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="SEARCH ARTISTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setSearchExpanded(false); }}
              ref={searchInputRef}
              className="flex-1 bg-transparent text-sm font-mono uppercase tracking-wide text-ink placeholder-ink-3 outline-none"
            />
            <button
              onClick={() => { setSearchQuery(''); setSearchExpanded(false); }}
              className="p-1.5 text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="px-5 pt-3 pb-2">
        <span className="text-sm text-ink-2">{filteredSets.length} artists</span>
      </div>

      {/* Artist list */}
      {filteredSets.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <p className="text-lg font-display font-bold text-ink-2">Can't find that one</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDayFilter(0);
              setSelectedStageFilter('all');
            }}
            className="mt-3 text-sm font-bold text-accent"
          >
            Show everyone
          </button>
        </div>
      ) : (
        <div className="divide-y divide-ink-2/15">
          {filteredSets.map((set) => (
            <ArtistCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
};
