import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import { useCurrentTime, useFestivalDay } from '../hooks/useCurrentTime';
import { timeToMinutes } from '../utils/clashDetection';
import { ArtistCard } from './ArtistCard';
import { StageSelector } from './StageSelector';
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

      {/* Now playing */}
      {playingNow.length > 0 && (
        <div className="px-5 py-3 border-b border-accent/20 bg-accent-soft/50">
          <span className="text-[10px] font-mono text-accent tracking-widest uppercase">On stage now</span>
          <span className="text-sm font-display font-bold text-ink block mt-0.5 truncate">
            {playingNow.map(s => s.artistName).join(' · ')}
          </span>
        </div>
      )}

      {/* Top section — not sticky */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex gap-2">
          {[
            { label: 'All', val: 0 },
            { label: 'Day 1', val: 1 },
            { label: 'Day 2', val: 2 },
            { label: 'Day 3', val: 3 },
            { label: 'Day 4', val: 4 }
          ].map(d => (
            <button
              key={d.val}
              onClick={() => setSelectedDayFilter(d.val)}
              className={`px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
                selectedDayFilter === d.val
                  ? 'bg-ink text-paper' : 'text-ink-2'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky bar — stage + search */}
      <div className="sticky top-[47px] z-30 bg-paper border-y border-ink-2/20 px-5 py-2 flex items-center gap-3 -mt-px">
        <StageSelector />

        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-paper-2 border border-ink-2/20 rounded-full text-sm text-ink placeholder-ink-2 outline-none transition-colors focus:border-ink-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
