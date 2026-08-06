import React, { useState } from 'react';
import type { ArtistSet, Stage } from '../types';
import { STAGES } from '../data/scheduleData';
import { useStore } from '../store/useStore';

interface Props {
  set: ArtistSet;
}

export const ArtistCard: React.FC<Props> = ({ set }) => {
  const { favoriteIds, toggleFavorite } = useStore();
  const isFavorited = favoriteIds.includes(set.id);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const stage: Stage = STAGES.find((s) => s.id === set.stageId) || {
    id: "main", name: "Main Stage", color: "#38bdf8", description: ""
  };

  const handleAction = () => {
    if (!isFavorited) {
      toggleFavorite(set.id);
    } else if (confirmRemove) {
      toggleFavorite(set.id);
      setConfirmRemove(false);
    } else {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
    }
  };

  return (
    <div
      className="group flex items-center gap-5 px-5 py-5"
      style={{
        borderLeftWidth: '3px',
        borderLeftStyle: 'solid',
        borderLeftColor: isFavorited ? stage.color : 'transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        <span className="text-xl font-display font-bold text-ink block truncate tracking-tight leading-tight">
          {set.artistName}
        </span>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-mono text-ink-2">
            {set.startTime}–{set.endTime}
          </span>
          <span className="text-sm font-display font-bold" style={{ color: stage.color }}>
            {stage.name}
          </span>
        </div>
      </div>

      <button
        onClick={handleAction}
        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-display font-bold transition-all ${
          confirmRemove
            ? 'bg-danger/15 text-danger border border-danger/40'
            : isFavorited
              ? 'bg-success/15 text-success border border-success/40'
              : 'text-ink border border-ink-2/30 hover:border-ink'
        }`}
      >
        {confirmRemove ? 'Remove?' : isFavorited ? 'In Lineup ✓' : 'Add to Lineup'}
      </button>
    </div>
  );
};
