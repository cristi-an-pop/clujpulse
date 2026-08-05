import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { ARTIST_SETS, STAGES } from '../data/scheduleData';
import { timeToMinutes } from '../utils/clashDetection';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  day: number;
}

export const WallpaperExporter: React.FC<Props> = ({ isOpen, onClose, day }) => {
  const { favoriteIds } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerated, setIsGenerated] = useState(false);

  const dayFavorites = ARTIST_SETS.filter(
    (s) => s.day === day && favoriteIds.includes(s.id)
  ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;

    ctx.fillStyle = '#0f0d17';
    ctx.fillRect(0, 0, width, height);

    // Subtle accent glow
    const glow = ctx.createRadialGradient(width / 2, 300, 20, width / 2, 300, 600);
    glow.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
    glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '500 32px sans-serif';
    ctx.fillText('CLUJPULSE', 80, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 72px sans-serif';
    ctx.fillText(`Day ${day} Lineup`, 80, 220);

    ctx.fillStyle = '#27272a';
    ctx.fillRect(80, 260, width - 160, 1);

    let startY = 320;
    const availableHeight = height - startY - 120;
    const maxItems = dayFavorites.length;
    const gap = maxItems > 12 ? 8 : maxItems > 8 ? 12 : 20;
    const cardHeight = Math.min(140, Math.floor((availableHeight - gap * (maxItems - 1)) / maxItems));
    const isCompact = cardHeight < 90;

    if (dayFavorites.length === 0) {
      ctx.fillStyle = '#71717a';
      ctx.font = '400 40px sans-serif';
      ctx.fillText('No artists in your lineup for this day.', 80, startY + 80);
    } else {
      dayFavorites.forEach((set) => {
        if (startY + cardHeight > height - 80) return;

        const stage = STAGES.find((s) => s.id === set.stageId) || { name: 'Stage', color: '#8b5cf6' };

        ctx.fillStyle = '#1c1926';
        ctx.beginPath();
        ctx.roundRect(80, startY, width - 160, cardHeight, 10);
        ctx.fill();

        ctx.fillStyle = stage.color;
        ctx.beginPath();
        ctx.roundRect(80, startY, 4, cardHeight, [10, 0, 0, 10]);
        ctx.fill();

        if (isCompact) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '600 34px sans-serif';
          ctx.fillText(set.artistName, 120, startY + cardHeight / 2 + 5);

          const timeStr = `${set.startTime}–${set.endTime}`;
          ctx.fillStyle = '#71717a';
          ctx.font = '400 26px monospace';
          const timeWidth = ctx.measureText(timeStr).width;
          ctx.fillText(timeStr, width - 120 - timeWidth, startY + cardHeight / 2 + 5);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = '600 44px sans-serif';
          ctx.fillText(set.artistName, 120, startY + 58);

          ctx.fillStyle = '#a1a1aa';
          ctx.font = '400 32px sans-serif';
          ctx.fillText(`${stage.name}`, 120, startY + 105);

          const timeStr = `${set.startTime}–${set.endTime}`;
          ctx.font = '500 28px monospace';
          const timeWidth = ctx.measureText(timeStr).width;
          ctx.fillStyle = '#71717a';
          ctx.fillText(timeStr, width - 120 - timeWidth, startY + 105);
        }

        startY += cardHeight + gap;
      });
    }

    ctx.fillStyle = '#3f3f46';
    ctx.font = '400 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UNTOLD 2026 · ClujPulse', width / 2, height - 80);
    ctx.textAlign = 'left';

    setIsGenerated(true);
  }, [isOpen, day, dayFavorites]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ClujPulse_Day${day}_Lineup.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-paper/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm bg-paper-2 border border-rule rounded-[var(--radius-lg)] p-5 z-10 flex flex-col items-center max-h-[90vh] overflow-y-auto"
          >
            <div className="w-full flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">
                Export Lock Screen
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-sm)] text-ink-3 hover:text-ink hover:bg-paper-3 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-2 text-center mb-4">
              Save as your lock screen wallpaper — check your lineup without unlocking your phone.
            </p>

            <div className="w-40 aspect-[9/16] rounded-[var(--radius-md)] overflow-hidden border border-rule bg-paper-3">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full flex gap-2 mt-5">
              <button
                onClick={handleDownload}
                disabled={!isGenerated}
                className="flex-1 py-2.5 px-4 rounded-[var(--radius-md)] bg-ink text-paper text-xs font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-[var(--radius-md)] bg-paper-3 text-ink-2 text-xs font-medium border border-rule hover:text-ink transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
