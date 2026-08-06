import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import { useCurrentTime, useFestivalDay } from '../hooks/useCurrentTime';
import { timeToMinutes } from '../utils/clashDetection';
import { ArtistCard } from './ArtistCard';
import { Search, X } from 'lucide-react';

export const ArtistsView: React.FC = () => {
  const {
    searchQuery, setSearchQuery,
    selectedDayFilter, setSelectedDayFilter,
    selectedStageFilter, setSelectedStageFilter
  } = useStore();

  const currentMinutes = useCurrentTime();
  const festivalDay = useFestivalDay();

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

  return (
    <div className="w-full pb-20">

      {/* Hero */}
      <div className="px-6 pt-10 pb-8">
        <h1 className="text-6xl sm:text-8xl font-display font-bold tracking-tight text-ink leading-none">
          Artists
        </h1>
        <p className="text-base text-ink-2 mt-4 max-w-md">
          {filteredSets.length} artists across {STAGES.length} stages.
        </p>
      </div>

      {/* Now playing */}
      {playingNow.length > 0 && (
        <div className="mx-6 mb-8 py-4 border-l-2 border-accent pl-5 bg-gradient-to-r from-accent-soft to-transparent">
          <span className="text-[10px] font-mono text-accent tracking-widest uppercase block mb-1">On stage now</span>
          <span className="text-lg font-display font-bold text-ink">
            {playingNow.map(s => s.artistName).join(' · ')}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="px-6 mb-8 space-y-4">
        {/* Days */}
        <div className="flex gap-2">
          {[
            { label: 'All', val: 0 },
            { label: 'Day 1', val: 1 },
            { label: 'Day 2', val: 2 },
            { label: 'Day 3', val: 3 },
            { label: 'Day 4', val: 4 }
          ].map((d) => (
            <button
              key={d.val}
              onClick={() => setSelectedDayFilter(d.val)}
              className={`px-4 py-2 rounded-full text-sm font-display font-bold transition-all ${
                selectedDayFilter === d.val
                  ? 'bg-ink text-paper'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Stages */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedStageFilter('all')}
            className={`text-base font-display font-bold whitespace-nowrap transition-colors relative ${
              selectedStageFilter === 'all' ? 'text-ink' : 'text-ink-2'
            }`}
          >
            All
            {selectedStageFilter === 'all' && (
              <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-ink rounded-full" />
            )}
          </button>
          {STAGES.map((stage) => {
            const isActive = selectedStageFilter === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageFilter(isActive ? 'all' : stage.id)}
                className={`text-base font-display font-bold whitespace-nowrap transition-colors relative ${!isActive ? 'text-ink-2' : ''}`}
                style={{ color: isActive ? stage.color : undefined }}
              >
                {stage.name}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: stage.color }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-2" />
          <input
            type="text"
            placeholder="Find an artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-8 py-2.5 bg-transparent border-b border-ink-2/30 text-ink placeholder-ink-2 text-sm font-body outline-none transition-colors focus:border-ink"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
        <div className="divide-y divide-ink-2/20">
          {filteredSets.map((set) => (
            <ArtistCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
};
