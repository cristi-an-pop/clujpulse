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
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-display font-bold transition-colors ${
          activeStage ? 'text-paper' : 'text-ink border border-ink-2/30'
        }`}
        style={activeStage ? { backgroundColor: color } : {}}
      >
        <span>{label}</span>
        <ChevronDown className="w-4 h-4 opacity-60" />
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-ink">Stage</h2>
                <button onClick={() => setOpen(false)} className="p-2 text-ink-2 hover:text-ink">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                <button
                  onClick={() => { setSelectedStageFilter('all'); setOpen(false); }}
                  className={`px-5 py-4 rounded-xl text-left text-lg font-display font-bold transition-colors ${
                    selectedStageFilter === 'all' ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-2'
                  }`}
                >
                  All Stages
                </button>

                {STAGES.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => { setSelectedStageFilter(stage.id); setOpen(false); }}
                    className="px-5 py-4 rounded-xl text-left text-lg font-display font-bold transition-colors"
                    style={{
                      backgroundColor: selectedStageFilter === stage.id ? stage.color : 'transparent',
                      color: selectedStageFilter === stage.id ? '#080612' : '#e4e4e7',
                    }}
                  >
                    {stage.name}
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
