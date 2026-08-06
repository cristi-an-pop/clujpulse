import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import type { ArtistSet, Stage } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { timeToMinutes, checkSetClash } from '../utils/clashDetection';
import { WallpaperExporter } from './WallpaperExporter';
import { StageSelector } from './StageSelector';
import { Modal } from './Modal';
import { Minus, Plus } from 'lucide-react';

const ZOOM_LEVELS = [180, 260, 360, 480];
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
    selectedStageFilter,
    timetableMode, setTimetableMode,
    activeDay, setActiveDay,
    setActiveTab
  } = useStore();

  const currentMinutes = useCurrentTime();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(2);

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
      const scrollTo = minutesToGridX(currentMinutes, hourWidth) - 200;
      if (scrollTo > 0) scrollRef.current.scrollLeft = scrollTo;
    }
  }, []);

  const gridWidth = 15 * hourWidth;

  return (
    <div className="w-full pb-16">

      {/* Top section — not sticky */}
      <div className="px-5 pt-6 pb-4 space-y-5">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
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

        {/* Day selector */}
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
              className={`px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
                (selectedDayFilter === d.val || (selectedDayFilter === 0 && activeDay === d.val))
                  ? 'bg-ink text-paper' : 'text-ink-2'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Lock screen link (desktop) */}
        <button
          onClick={() => setIsWallpaperModalOpen(true)}
          className="hidden sm:flex items-center gap-2 text-sm font-display font-bold text-ink-2 hover:text-ink transition-colors"
        >
          Save as Lock Screen →
        </button>
      </div>

      {/* Sticky bar — stage + zoom */}
      <div className="sticky top-[48px] z-30 bg-paper border-b border-ink-2/20 px-5 py-2.5 flex items-center justify-between gap-3">
        <StageSelector />
        <div className="flex items-center gap-1 bg-paper-2 rounded-full border border-ink-2/20 px-1.5 py-1">
          <button
            onClick={() => setZoomIdx(Math.max(0, zoomIdx - 1))}
            disabled={zoomIdx === 0}
            className="p-1.5 rounded-full text-ink-2 disabled:opacity-20"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-ink-2 w-6 text-center">{['S', 'M', 'L', 'XL'][zoomIdx]}</span>
          <button
            onClick={() => setZoomIdx(Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1))}
            disabled={zoomIdx === ZOOM_LEVELS.length - 1}
            className="p-1.5 rounded-full text-ink-2 disabled:opacity-20"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                  <div key={i} className="flex items-end pb-2 px-3 border-l border-ink-2/20" style={{ width: hourWidth }}>
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
                        <div key={i} className="absolute top-0 bottom-0 border-l border-ink-2/10" style={{ left: i * hourWidth }} />
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
                        <div className="absolute top-0 bottom-0 w-0.5 bg-accent/30" style={{ left: minutesToGridX(currentMinutes, hourWidth) }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile lock screen button */}
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="fixed bottom-16 right-4 z-30 px-4 py-2.5 rounded-full text-xs font-display font-bold bg-paper-2 text-ink border border-rule shadow-lg sm:hidden"
          >
            Lock Screen →
          </button>
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
      className="absolute top-2 bottom-2 rounded-lg flex flex-col justify-center px-3 cursor-pointer overflow-hidden transition-all hover:brightness-110"
      style={{
        left,
        width: Math.max(width, 50),
        backgroundColor: isFavorited ? stage.color : `${stage.color}18`,
        color: isFavorited ? '#080612' : '#e4e4e7',
        boxShadow: isFavorited ? `0 2px 12px ${stage.color}30` : 'none',
        border: hasClash ? '2px solid var(--color-danger)' : `1px solid ${isFavorited ? stage.color : stage.color + '50'}`,
      }}
      title={`${set.artistName} · ${set.startTime}–${set.endTime}`}
    >
      <span className="text-[13px] font-display font-bold truncate tracking-tight leading-tight">
        {set.artistName}
      </span>
      {hasClash ? (
        <span className="text-[10px] font-display font-bold text-danger mt-0.5">OVERLAP</span>
      ) : width > 120 ? (
        <span className="text-[10px] font-mono opacity-50 mt-0.5">{set.startTime}–{set.endTime}</span>
      ) : null}
    </div>
  );
}
