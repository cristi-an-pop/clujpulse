import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import type { ArtistSet, Stage } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { timeToMinutes, checkSetClash } from '../utils/clashDetection';
import { WallpaperExporter } from './WallpaperExporter';
import { AlertTriangle, ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from './Modal';

const ZOOM_LEVELS = [140, 180, 240, 320];
const ROW_HEIGHT = 80;
const HOURS = Array.from({ length: 15 }, (_, i) => (16 + i) % 24);
const GRID_END = 840;

function minutesToGridX(minutes: number, hourWidth: number): number {
  return (minutes / 60) * hourWidth;
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
  const [zoomIdx, setZoomIdx] = useState(1);

  const hourWidth = ZOOM_LEVELS[zoomIdx];

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
      const scrollTo = minutesToGridX(currentMinutes, hourWidth) - 300;
      if (scrollTo > 0) scrollRef.current.scrollLeft = scrollTo;
    }
  }, []);

  const gridWidth = 15 * hourWidth;

  return (
    <div className="w-full pb-16">

      {/* Controls */}
      <div className="px-6 pt-8 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
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

        {/* Mode toggle */}
        <div className="flex items-center gap-1 mb-6">
          <button
            onClick={() => setTimetableMode('full')}
            className={`px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
              timetableMode === 'full' ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Everyone
          </button>
          <button
            onClick={() => setTimetableMode('my-lineup')}
            className={`px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
              timetableMode === 'my-lineup' ? 'bg-accent text-paper' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Your Picks
            {myFavorites.length > 0 && (
              <span className="ml-1.5 font-mono text-xs opacity-80">{myFavorites.length}</span>
            )}
          </button>
          {timetableMode === 'my-lineup' && myFavorites.length > 0 && (
            <button onClick={() => setShowClearModal(true)} className="ml-auto text-xs font-mono text-danger">
              clear
            </button>
          )}
        </div>

        {/* Day + stage + zoom */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
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
                  onClick={() => { setSelectedDayFilter(d.val); if (d.val !== 0) setActiveDay(d.val); }}
                  className={`px-4 py-2 rounded-full text-sm font-display font-bold transition-all ${
                    selectedDayFilter === d.val
                      ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))}
                disabled={zoomIdx === 0}
                className="p-2 rounded-full text-ink-2 hover:text-ink disabled:opacity-30 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))}
                disabled={zoomIdx === ZOOM_LEVELS.length - 1}
                className="p-2 rounded-full text-ink-2 hover:text-ink disabled:opacity-30 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stages */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedStageFilter('all')}
              className={`text-base font-display font-bold whitespace-nowrap relative ${selectedStageFilter === 'all' ? 'text-ink' : 'text-ink-2'}`}
            >
              All
              {selectedStageFilter === 'all' && <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-ink rounded-full" />}
            </button>
            {STAGES.map(s => {
              const isActive = selectedStageFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStageFilter(isActive ? 'all' : s.id)}
                  className={`text-base font-display font-bold whitespace-nowrap relative ${!isActive ? 'text-ink-2' : ''}`}
                  style={{ color: isActive ? s.color : undefined }}
                >
                  {s.name}
                  {isActive && <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />}
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
          <button onClick={() => setActiveTab('artists')} className="mt-6 px-6 py-3 rounded-full font-display font-bold text-sm bg-ink text-paper">
            Browse Artists
          </button>
        </div>
      ) : (
        <div className="relative mt-2">
          <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
            <div style={{ width: gridWidth }}>
              {/* Time header — sits outside the stage rows */}
              <div className="flex h-8 border-b border-ink-2/40 mb-1">
                {HOURS.map((hour, i) => (
                  <div
                    key={i}
                    className="flex items-end pb-1.5 px-3 border-l border-ink-2/20"
                    style={{ width: hourWidth }}
                  >
                    <span className="text-xs font-mono text-ink">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Stage rows */}
              {visibleStages.map((stage) => {
                const stageSets = displayedSets.filter(s => s.stageId === stage.id);
                return (
                  <div key={stage.id} className="border-b border-ink-2/30">
                    {/* Stage label row */}
                    <div className="sticky left-0 z-10 pt-3 pb-1 px-4 flex items-center gap-2" style={{ width: 'fit-content' }}>
                      <span className="text-base font-display font-bold" style={{ color: stage.color }}>
                        {stage.name}
                      </span>
                      <span className="text-xs font-mono text-ink-2">{stageSets.length}</span>
                    </div>
                    {/* Timeline blocks */}
                    <div className="relative" style={{ height: ROW_HEIGHT }}>
                      {HOURS.map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-ink-2/15" style={{ left: i * hourWidth }} />
                      ))}
                      {stageSets.map((set) => (
                        <SetBlock
                          key={set.id}
                          set={set}
                          stage={stage}
                          hourWidth={hourWidth}
                          isFavorited={favoriteIds.includes(set.id)}
                          onToggle={() => toggleFavorite(set.id)}
                          clashInfo={
                            favoriteIds.includes(set.id) && timetableMode === 'my-lineup'
                              ? checkSetClash(set, myFavorites) : null
                          }
                        />
                      ))}
                      {currentMinutes >= 0 && currentMinutes <= GRID_END && (
                        <div className="absolute top-0 bottom-0 w-0.5 bg-accent/30 z-5" style={{ left: minutesToGridX(currentMinutes, hourWidth) }} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Current time indicator */}
              {currentMinutes >= 0 && currentMinutes <= GRID_END && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent z-30 pointer-events-none"
                  style={{ left: minutesToGridX(currentMinutes, hourWidth) }}
                >
                  <div className="sticky top-[53px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                </div>
              )}
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
  hourWidth: number;
  isFavorited: boolean;
  onToggle: () => void;
  clashInfo: ReturnType<typeof import('../utils/clashDetection').checkSetClash> | null;
}

function SetBlock({ set, stage, hourWidth, isFavorited, onToggle, clashInfo }: SetBlockProps) {
  const startMin = timeToMinutes(set.startTime);
  const endMin = timeToMinutes(set.endTime);
  const duration = endMin - startMin;

  const left = minutesToGridX(startMin, hourWidth);
  const width = minutesToGridX(duration, hourWidth);
  const hasClash = clashInfo?.hasClash ?? false;

  return (
    <div
      onClick={onToggle}
      className={`absolute top-2 bottom-2 rounded-lg flex items-center px-3 gap-2 cursor-pointer overflow-hidden transition-all hover:brightness-110 ${
        hasClash ? 'ring-2 ring-danger ring-offset-1 ring-offset-paper' : ''
      }`}
      style={{
        left,
        width: Math.max(width, 50),
        backgroundColor: isFavorited ? stage.color : `${stage.color}18`,
        color: isFavorited ? '#080612' : '#e4e4e7',
        boxShadow: isFavorited ? `0 2px 12px ${stage.color}30` : 'none',
        border: `1px solid ${isFavorited ? stage.color : stage.color + '50'}`,
      }}
      title={`${set.artistName} · ${set.startTime}–${set.endTime}`}
    >
      {hasClash && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-danger" />}
      <span className="text-[13px] font-display font-bold truncate tracking-tight">
        {set.artistName}
      </span>
      {width > 140 && (
        <span className="text-[11px] font-mono opacity-50 shrink-0 ml-auto">
          {set.startTime}
        </span>
      )}
    </div>
  );
}
