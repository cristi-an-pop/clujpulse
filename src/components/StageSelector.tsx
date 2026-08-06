import React, { useState } from 'react';
import { STAGES } from '../data/scheduleData';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

export const StageSelector: React.FC = () => {
  const { selectedStageFilter, setSelectedStageFilter } = useStore();
  const [open, setOpen] = useState(false);

  const activeStage = STAGES.find(s => s.id === selectedStageFilter);
  const label = activeStage ? activeStage.name : 'All Stages';
  const color = activeStage?.color;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-ink-2/30 text-sm font-display font-bold transition-colors hover:border-ink-2"
        style={{ color: color || undefined }}
      >
        {color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
        <span>{label}</span>
        <ChevronDown className="w-4 h-4 text-ink-2" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            <div className="absolute inset-0 bg-paper/95 backdrop-blur-lg" onClick={() => setOpen(false)} />

            <div className="relative z-10 flex flex-col h-full px-6 pt-6 pb-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-ink">Stage</h2>
                <button onClick={() => setOpen(false)} className="p-2 text-ink-2 hover:text-ink">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                <button
                  onClick={() => { setSelectedStageFilter('all'); setOpen(false); }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-colors ${
                    selectedStageFilter === 'all' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-2'
                  }`}
                >
                  <span className="text-lg font-display font-bold">All Stages</span>
                </button>

                {STAGES.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => { setSelectedStageFilter(stage.id); setOpen(false); }}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-colors ${
                      selectedStageFilter === stage.id ? 'bg-paper-3 border border-ink-2/30' : 'hover:bg-paper-2'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <div>
                      <span className="text-lg font-display font-bold" style={{ color: stage.color }}>
                        {stage.name}
                      </span>
                      <span className="text-xs text-ink-2 block mt-0.5">{stage.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
