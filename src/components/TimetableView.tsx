import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import type { ArtistSet, Stage } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { timeToMinutes, doSetsOverlap, checkSetClash } from '../utils/clashDetection';
import { WallpaperExporter } from './WallpaperExporter';
import { StageSelector } from './StageSelector';
import { DayPills } from './DayPills';
import { Modal } from './Modal';
import { Clock } from 'lucide-react';

const HOUR_WIDTH = 360;
const ROW_HEIGHT = 80;
const HOURS = Array.from({ length: 15 }, (_, i) => (16 + i) % 24);
const GRID_END = 840;

function minutesToGridX(minutes: number): number {
  return (minutes / 60) * HOUR_WIDTH;
}

export const TimetableView: React.FC = () => {
  const {
    favoriteIds, toggleFavorite, clearFavorites,
    selectedDayFilter, setSelectedDayFilter,
    selectedStageFilter,
    timetableMode, setTimetableMode,
    activeDay, setActiveDay,
    setActiveTab
  } = useStore();

  const currentMinutes = useCurrentTime();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const myFavorites = useMemo(() => {
    return ARTIST_SETS.filter(s => favoriteIds.includes(s.id));
  }, [favoriteIds]);

  const visibleStages = useMemo(() => {
    if (selectedStageFilter === 'all') return STAGES;
    return STAGES.filter(s => s.id === selectedStageFilter);
  }, [selectedStageFilter]);

  const displayedSets = useMemo(() => {
    const baseList = timetableMode === 'my-lineup' ? myFavorites : ARTIST_SETS;
    const dayFilter = selectedDayFilter !== 0 ? selectedDayFilter : activeDay;
    return baseList.filter(s => {
      if (s.day !== dayFilter) return false;
      if (selectedStageFilter !== 'all' && s.stageId !== selectedStageFilter) return false;
      return true;
    });
  }, [timetableMode, myFavorites, selectedDayFilter, selectedStageFilter, activeDay]);

  const [isAwayFromNow, setIsAwayFromNow] = useState(false);

  const clashPairs = useMemo(() => {
    if (timetableMode !== 'my-lineup') return [];
    const dayFilter = selectedDayFilter !== 0 ? selectedDayFilter : activeDay;
    const daySets = myFavorites.filter(s => s.day === dayFilter);
    const seen = new Set<string>();
    const pairs: { a: ArtistSet; b: ArtistSet }[] = [];
    for (let i = 0; i < daySets.length; i++) {
      for (let j = i + 1; j < daySets.length; j++) {
        const { overlaps } = doSetsOverlap(daySets[i], daySets[j]);
        if (overlaps) {
          const key = [daySets[i].id, daySets[j].id].sort().join(':');
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push({ a: daySets[i], b: daySets[j] });
          }
        }
      }
    }
    return pairs;
  }, [timetableMode, myFavorites, selectedDayFilter, activeDay]);

  const [clashScrollIdx, setClashScrollIdx] = useState(0);

  const scrollToSet = useCallback((set: ArtistSet) => {
    if (!scrollRef.current) return;
    const startMin = timeToMinutes(set.startTime);
    const x = minutesToGridX(startMin) - 100;
    scrollRef.current.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
  }, [HOUR_WIDTH]);

  const handleClashTap = useCallback(() => {
    if (clashPairs.length === 0) return;
    const idx = clashScrollIdx % clashPairs.length;
    scrollToSet(clashPairs[idx].a);
    setClashScrollIdx(idx + 1);
  }, [clashPairs, clashScrollIdx, scrollToSet]);

  const scrollToNow = useCallback(() => {
    if (!scrollRef.current || currentMinutes <= 0) return;
    const x = minutesToGridX(currentMinutes) - 200;
    scrollRef.current.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
  }, [currentMinutes]);

  useEffect(() => {
    if (scrollRef.current && currentMinutes > 0) {
      const scrollTo = minutesToGridX(currentMinutes) - 200;
      if (scrollTo > 0) scrollRef.current.scrollLeft = scrollTo;
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || currentMinutes <= 0 || currentMinutes > GRID_END) return;
    const nowX = minutesToGridX(currentMinutes);
    const checkDistance = () => {
      const viewCenter = el.scrollLeft + el.clientWidth / 2;
      setIsAwayFromNow(Math.abs(viewCenter - nowX) > el.clientWidth * 0.6);
    };
    checkDistance();
    el.addEventListener('scroll', checkDistance, { passive: true });
    return () => el.removeEventListener('scroll', checkDistance);
  }, [currentMinutes]);

  const gridWidth = 15 * HOUR_WIDTH;

  return (
    <div className="w-full pb-16">

      {/* Mode toggle — scrolls away */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimetableMode('full')}
            className={`px-5 py-2.5 rounded-full text-base font-display font-bold transition-all ${
              timetableMode === 'full' ? 'bg-ink text-paper' : 'text-ink-2'
            }`}
          >
            Everyone
          </button>
          <button
            onClick={() => setTimetableMode('my-lineup')}
            className={`px-5 py-2.5 rounded-full text-base font-display font-bold transition-all ${
              timetableMode === 'my-lineup' ? 'bg-accent text-paper' : 'text-ink-2'
            }`}
          >
            Your Picks
            {myFavorites.length > 0 && (
              <span className="ml-1.5 font-mono text-sm opacity-80">{myFavorites.length}</span>
            )}
          </button>
        </div>

        {timetableMode === 'my-lineup' && myFavorites.length > 0 && (
          <button onClick={() => setShowClearModal(true)} className="text-xs font-mono text-danger">
            clear
          </button>
        )}
      </div>

      {/* Sticky bar — days + stage */}
      <div className="sticky top-0 z-40 bg-paper border-b border-ink/10 px-4 py-2 flex flex-col items-center gap-2">
        <DayPills
          activeDay={selectedDayFilter !== 0 ? selectedDayFilter : activeDay}
          onDayChange={(day) => { setSelectedDayFilter(day); setActiveDay(day); }}
        />
        <StageSelector />
      </div>

      {/* Clash summary banner */}
      {timetableMode === 'my-lineup' && clashPairs.length > 0 && (
        <button
          onClick={handleClashTap}
          className="w-full px-5 py-2 flex items-center gap-2 bg-danger-soft border-b border-danger/20 text-sm transition-colors active:opacity-70"
        >
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <span className="font-display font-semibold text-danger">
            {clashPairs.length} {clashPairs.length === 1 ? 'overlap' : 'overlaps'}
          </span>
          <span className="text-ink-2 text-xs font-mono ml-auto">tap to jump →</span>
        </button>
      )}

      {/* Grid */}
      {timetableMode === 'my-lineup' && myFavorites.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <p className="text-2xl font-display font-bold text-ink-3 tracking-tight">Nothing here yet</p>
          <p className="text-sm text-ink-2 mt-3">Head to Artists and build your night.</p>
          <button onClick={() => setActiveTab('artists')} className="mt-6 px-6 py-3 rounded-full font-display font-bold text-sm bg-ink text-paper">
            Browse Artists
          </button>
        </div>
      ) : (
        <div className="relative">
          <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
            <div style={{ width: gridWidth }}>
              {/* Time header */}
              <div className="flex h-9 border-b border-ink-2/30">
                {HOURS.map((hour, i) => (
                  <div key={i} className="flex items-end pb-2 px-3 border-l border-ink-2/20" style={{ width: HOUR_WIDTH }}>
                    <span className="text-xs font-mono text-ink">{hour.toString().padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>

              {/* Stage rows */}
              {visibleStages.map((stage) => {
                const stageSets = displayedSets.filter(s => s.stageId === stage.id);
                return (
                  <div key={stage.id} className="border-b border-ink-2/20">
                    <div className="sticky left-0 z-10 pt-2.5 pb-1 px-4 flex items-center gap-2" style={{ width: 'fit-content' }}>
                      <span className="text-sm font-display font-bold" style={{ color: stage.color }}>{stage.name}</span>
                      <span className="text-[11px] font-mono text-ink-2">{stageSets.length}</span>
                    </div>
                    <div className="relative" style={{ height: ROW_HEIGHT }}>
                      {HOURS.map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-ink-2/10" style={{ left: i * HOUR_WIDTH }} />
                      ))}
                      {stageSets.map((set) => (
                        <SetBlock
                          key={set.id}
                          set={set}
                          stage={stage}
                          isFavorited={favoriteIds.includes(set.id)}
                          onToggle={() => toggleFavorite(set.id)}
                          clashInfo={
                            favoriteIds.includes(set.id) && timetableMode === 'my-lineup'
                              ? checkSetClash(set, myFavorites) : null
                          }
                        />
                      ))}
                      {currentMinutes >= 0 && currentMinutes <= GRID_END && (
                        <div className="absolute top-0 bottom-0 w-0.5 bg-accent/30" style={{ left: minutesToGridX(currentMinutes) }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating actions — bottom */}
          <div className="sticky bottom-14 z-30 flex items-center justify-center gap-3 pointer-events-none mt-4">
            {isAwayFromNow && currentMinutes > 0 && currentMinutes <= GRID_END && (
              <button
                onClick={scrollToNow}
                className="pointer-events-auto flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-display font-bold bg-accent/90 backdrop-blur-sm text-paper border border-accent/50 shadow-lg transition-opacity"
              >
                <Clock className="w-3.5 h-3.5" />
                Now
              </button>
            )}
            <button
              onClick={() => setIsWallpaperModalOpen(true)}
              className="pointer-events-auto px-5 py-2.5 rounded-full text-xs font-display font-bold bg-paper-2/90 backdrop-blur-sm text-ink-2 border border-rule/50 shadow-lg hover:text-ink transition-colors"
            >
              Save as Lock Screen →
            </button>
          </div>
        </div>
      )}

      <WallpaperExporter
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        day={selectedDayFilter !== 0 ? selectedDayFilter : activeDay}
      />

      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear lineup?">
        <p className="text-sm text-ink-2 mb-5">
          This removes all {myFavorites.length} artists from your picks.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { clearFavorites(); setShowClearModal(false); }}
            className="flex-1 py-3 rounded-full text-sm font-display font-bold bg-danger/20 text-danger border border-danger/30"
          >
            Clear all
          </button>
          <button
            onClick={() => setShowClearModal(false)}
            className="flex-1 py-3 rounded-full text-sm font-display font-bold text-ink-2 border border-rule"
          >
            Keep
          </button>
        </div>
      </Modal>
    </div>
  );
};

interface SetBlockProps {
  set: ArtistSet;
  stage: Stage;
  isFavorited: boolean;
  onToggle: () => void;
  clashInfo: ReturnType<typeof import('../utils/clashDetection').checkSetClash> | null;
}

function SetBlock({ set, stage, isFavorited, onToggle, clashInfo }: SetBlockProps) {
  const startMin = timeToMinutes(set.startTime);
  const endMin = timeToMinutes(set.endTime);
  const duration = endMin - startMin;
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHold = React.useRef(false);

  const left = minutesToGridX(startMin);
  const width = minutesToGridX(duration);
  const hasClash = clashInfo?.hasClash ?? false;

  const handleClick = () => {
    if (didHold.current) { didHold.current = false; return; }
    if (showTooltip) { setShowTooltip(false); return; }
    if (!isFavorited) {
      onToggle();
    } else if (confirmRemove) {
      onToggle();
      setConfirmRemove(false);
    } else {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
    }
  };

  const handleTouchStart = () => {
    didHold.current = false;
    holdTimer.current = setTimeout(() => {
      setShowTooltip(true);
      didHold.current = true;
    }, 400);
  };

  const handleTouchEnd = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (showTooltip) {
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="absolute top-2 bottom-2 rounded-lg flex flex-col justify-center px-3 cursor-pointer transition-all hover:brightness-110"
      style={{
        left,
        width: Math.max(width, 50),
        overflow: 'visible',
        backgroundColor: confirmRemove ? 'var(--color-danger-soft)' : isFavorited ? stage.color : `${stage.color}18`,
        color: confirmRemove ? 'var(--color-danger)' : isFavorited ? '#080612' : '#e4e4e7',
        boxShadow: isFavorited && !confirmRemove ? `0 2px 12px ${stage.color}30` : 'none',
        border: confirmRemove ? '2px solid var(--color-danger)' : hasClash ? '2px solid var(--color-danger)' : `1px solid ${isFavorited ? stage.color : stage.color + '50'}`,
      }}
    >
      <div className="overflow-hidden">
        {confirmRemove ? (
          <span className="text-[12px] font-display font-bold">Tap to remove</span>
        ) : (
          <>
            <span className="text-[13px] font-display font-bold truncate block tracking-tight leading-tight">
              {set.artistName}
            </span>
            {hasClash ? (
              <span className="text-[10px] font-display font-bold text-danger mt-0.5 block">OVERLAP</span>
            ) : width > 120 ? (
              <span className="text-[10px] font-mono opacity-50 mt-0.5 block">{set.startTime}–{set.endTime}</span>
            ) : null}
          </>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && !confirmRemove && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-ink text-paper rounded-lg shadow-xl text-[12px] font-display font-bold whitespace-nowrap z-[100] pointer-events-none">
          {set.artistName}
          <span className="text-ink-2 font-mono font-normal ml-2">{set.startTime}–{set.endTime}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink" />
        </div>
      )}
    </div>
  );
}
