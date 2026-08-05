import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveTab, StageId } from '../types';

interface AppState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;

  activeDay: number;
  setActiveDay: (day: number) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  selectedStageId: StageId | null;
  setSelectedStageId: (stageId: StageId | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDayFilter: number;
  setSelectedDayFilter: (day: number) => void;
  selectedStageFilter: string;
  setSelectedStageFilter: (stageId: string) => void;

  timetableMode: 'my-lineup' | 'full';
  setTimetableMode: (mode: 'my-lineup' | 'full') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id: string) => {
        const current = get().favoriteIds;
        const next = current.includes(id)
          ? current.filter(item => item !== id)
          : [...current, id];
        set({ favoriteIds: next });
      },
      clearFavorites: () => set({ favoriteIds: [] }),

      activeDay: 1,
      setActiveDay: (day: number) => set({ activeDay: day }),
      activeTab: 'timetable',
      setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),

      selectedStageId: null,
      setSelectedStageId: (stageId: StageId | null) => set({ selectedStageId: stageId }),

      searchQuery: '',
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      selectedDayFilter: 1,
      setSelectedDayFilter: (day: number) => set({ selectedDayFilter: day }),
      selectedStageFilter: 'all',
      setSelectedStageFilter: (stageId: string) => set({ selectedStageFilter: stageId }),

      timetableMode: 'full',
      setTimetableMode: (mode: 'my-lineup' | 'full') => set({ timetableMode: mode }),
    }),
    {
      name: 'clujpulse-storage',
      partialize: (state) => ({
        favoriteIds: state.favoriteIds,
        activeDay: state.activeDay,
      }),
    }
  )
);
