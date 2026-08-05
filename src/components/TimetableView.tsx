import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import type { ArtistSet, Stage } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { timeToMinutes, checkSetClash } from '../utils/clashDetection';
import { WallpaperExporter } from './WallpaperExporter';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

const HOUR_WIDTH = 180;
const ROW_HEIGHT = 100;
const HOURS = Array.from({ length: 15 }, (_, i) => (16 + i) % 24);
const GRID_END = 840;

function minutesToGridX(minutes: number): number {
  return (minutes / 60) * HOUR_WIDTH;
}

export const TimetableView: React.FC = () => {
  const {
    favoriteIds, toggleFavorite, clearFavorites,
    selectedDayFilter, setSelectedDayFilter,
    selectedStageFilter, setSelectedStageFilter,
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

  useEffect(() => {
    if (scrollRef.current && currentMinutes > 0) {
      const scrollTo = minutesToGridX(currentMinutes) - 300;
      if (scrollTo > 0) {
        scrollRef.current.scrollLeft = scrollTo;
      }
    }
  }, []);

  const gridWidth = 15 * HOUR_WIDTH;

  return (
    <div className="w-full pb-20">

      {/* Hero + controls */}
      <div className="px-6 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <h1 className="text-6xl sm:text-8xl font-display font-bold tracking-tight text-ink leading-none">
            Schedule
          </h1>
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-bold text-ink-2 border border-rule hover:text-ink hover:border-ink-3 transition-colors"
          >
            Save as Lock Screen →
          </button>
        </div>

        {/* Mode toggle — fluid, not boxy */}
        <div className="flex items-center gap-1 mb-8">
          <button
            onClick={() => setTimetableMode('full')}
            className={`px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
              timetableMode === 'full'
                ? 'bg-ink text-paper'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Everyone
          </button>
          <button
            onClick={() => setTimetableMode('my-lineup')}
            className={`px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
              timetableMode === 'my-lineup'
                ? 'bg-accent text-paper'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Your Picks
            {myFavorites.length > 0 && (
              <span className="ml-1.5 font-mono text-xs opacity-80">{myFavorites.length}</span>
            )}
          </button>

          {timetableMode === 'my-lineup' && myFavorites.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="ml-auto text-xs font-mono text-danger"
            >
              clear
            </button>
          )}
        </div>

        {/* Day + stage selectors */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-2">
            {[
              { label: 'Day 1', val: 1 },
              { label: 'Day 2', val: 2 },
              { label: 'Day 3', val: 3 },
              { label: 'Day 4', val: 4 }
            ].map(d => (
              <button
                key={d.val}
                onClick={() => { setSelectedDayFilter(d.val); setActiveDay(d.val); }}
                className={`px-4 py-2 rounded-full text-sm font-display font-bold transition-all ${
                  (selectedDayFilter === d.val || (selectedDayFilter === 0 && activeDay === d.val))
                    ? 'bg-ink text-paper'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedStageFilter('all')}
              className={`text-sm font-display font-bold whitespace-nowrap relative ${
                selectedStageFilter === 'all' ? 'text-ink' : 'text-ink-3'
              }`}
            >
              All
              {selectedStageFilter === 'all' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-ink rounded-full" />
              )}
            </button>
            {STAGES.map(s => {
              const isActive = selectedStageFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStageFilter(isActive ? 'all' : s.id)}
                  className="text-sm font-display font-bold whitespace-nowrap relative"
                  style={{ color: isActive ? s.color : undefined }}
                >
                  {s.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      {timetableMode === 'my-lineup' && myFavorites.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <p className="text-3xl font-display font-bold text-ink-3 tracking-tight">Nothing here yet</p>
          <p className="text-sm text-ink-3 mt-3">Head to Artists and build your night.</p>
          <button
            onClick={() => setActiveTab('artists')}
            className="mt-6 px-6 py-3 rounded-full font-display font-bold text-sm bg-ink text-paper"
          >
            Browse Artists
          </button>
        </div>
      ) : (
        <div className="mt-2 flex">
          {/* Sticky stage names column */}
          <div className="shrink-0 w-[140px] z-20 bg-paper">
            {/* Header spacer */}
            <div className="h-10 border-b border-rule/30" />
            {/* Stage labels */}
            {visibleStages.map((stage, stageIdx) => {
              const stageSets = displayedSets.filter(s => s.stageId === stage.id);
              return (
                <div
                  key={stage.id}
                  className="flex flex-col justify-center gap-1 px-5"
                  style={{
                    height: ROW_HEIGHT,
                    borderBottom: stageIdx < visibleStages.length - 1 ? '1px solid oklch(16% 0.02 290 / 0.3)' : 'none'
                  }}
                >
                  <span className="text-base font-display font-bold tracking-tight" style={{ color: stage.color }}>
                    {stage.name}
                  </span>
                  <span className="text-[11px] font-mono text-ink-3">
                    {stageSets.length} set{stageSets.length !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Scrollable timeline */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto no-scrollbar">
            <div style={{ width: gridWidth }}>
              {/* Time header */}
              <div className="flex h-10 border-b border-rule/30 sticky top-[57px] bg-paper/90 backdrop-blur-md z-10 relative">
                {HOURS.map((hour, i) => (
                  <div key={i} className="flex items-center px-3" style={{ width: HOUR_WIDTH }}>
                    <span className="text-[11px] font-mono text-ink-3">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
                {currentMinutes >= 0 && currentMinutes <= GRID_END && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-accent z-20"
                    style={{ left: minutesToGridX(currentMinutes) }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                  </div>
                )}
              </div>

              {/* Stage rows */}
              {visibleStages.map((stage, stageIdx) => {
                const stageSets = displayedSets.filter(s => s.stageId === stage.id);
                return (
                  <div
                    key={stage.id}
                    className="relative"
                    style={{
                      height: ROW_HEIGHT,
                      borderBottom: stageIdx < visibleStages.length - 1 ? '1px solid oklch(16% 0.02 290 / 0.3)' : 'none'
                    }}
                  >
                    {HOURS.map((_, i) => (
                      <div key={i} className="absolute top-4 bottom-4 w-px bg-rule/20" style={{ left: i * HOUR_WIDTH }} />
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
                            ? checkSetClash(set, myFavorites)
                            : null
                        }
                      />
                    ))}
                    {currentMinutes >= 0 && currentMinutes <= GRID_END && (
                      <div className="absolute top-0 bottom-0 w-px bg-accent/20" style={{ left: minutesToGridX(currentMinutes) }} />
                    )}
                  </div>
                );
              })}
            </div>
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
          This removes all {myFavorites.length} artists from your picks. You can always re-add them.
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

  const left = minutesToGridX(startMin);
  const width = minutesToGridX(duration);

  const hasClash = clashInfo?.hasClash ?? false;

  return (
    <div
      onClick={onToggle}
      className={`absolute top-3 bottom-3 rounded-full flex items-center px-4 gap-2 cursor-pointer overflow-hidden transition-all ${
        hasClash ? 'ring-2 ring-danger ring-offset-1 ring-offset-paper' : ''
      }`}
      style={{
        left,
        width: Math.max(width, 70),
        backgroundColor: isFavorited ? stage.color : `${stage.color}18`,
        color: isFavorited ? '#080612' : stage.color,
        boxShadow: isFavorited ? `0 4px 20px ${stage.color}40` : 'none',
      }}
      title={`${set.artistName} · ${set.startTime}–${set.endTime}`}
    >
      {hasClash && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-danger" />}
      <span className="text-base font-display font-bold truncate tracking-tight">
        {set.artistName}
      </span>
      {width > 180 && (
        <span className="text-[11px] font-mono opacity-60 shrink-0 ml-auto">
          {set.startTime}
        </span>
      )}
    </div>
  );
}
