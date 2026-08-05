import React from 'react';
import type { ArtistSet, Stage } from '../types';
import { STAGES } from '../data/scheduleData';
import { useStore } from '../store/useStore';

interface Props {
  set: ArtistSet;
}

export const ArtistCard: React.FC<Props> = ({ set }) => {
  const { favoriteIds, toggleFavorite } = useStore();
  const isFavorited = favoriteIds.includes(set.id);

  const stage: Stage = STAGES.find((s) => s.id === set.stageId) || {
    id: "main", name: "Main Stage", color: "#38bdf8", description: ""
  };

  return (
    <div
      className="group flex items-center gap-5 px-6 py-5 cursor-pointer transition-colors hover:bg-paper-2/50"
      onClick={() => toggleFavorite(set.id)}
    >
      {/* Stage color accent */}
      <div
        className="w-1 self-stretch rounded-full shrink-0 transition-all"
        style={{
          backgroundColor: isFavorited ? stage.color : 'transparent',
          boxShadow: isFavorited ? `0 0 12px ${stage.color}60` : 'none'
        }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="text-2xl font-display font-bold text-ink block truncate tracking-tight leading-tight">
          {set.artistName}
        </span>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-mono text-ink-2">
            {set.startTime}–{set.endTime}
          </span>
          <span className="text-base font-display font-bold" style={{ color: stage.color }}>
            {stage.name}
          </span>
          {set.genre && (
            <span className="text-xs text-ink-3 hidden sm:inline">
              {set.genre}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
          isFavorited
            ? 'bg-success/20 text-success border border-success/40'
            : 'text-ink-2 border border-rule group-hover:border-ink-3 group-hover:text-ink'
        }`}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(set.id); }}
      >
        {isFavorited ? 'In Lineup ✓' : 'Add to Lineup'}
      </button>
    </div>
  );
};
