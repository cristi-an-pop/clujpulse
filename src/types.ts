export type StageId = "alchemy" | "daydreaming" | "form" | "galaxy" | "main" | "retro" | "soul_circle" | "time" | "tram";

export interface ArtistSet {
  id: string;
  artistName: string;
  stageId: StageId;
  day: number; // 1, 2, 3, or 4
  startTime: string; // "20:00" (24h format)
  endTime: string;   // "21:30"
  genre?: string;
  imageUrl?: string;
  description?: string;
  tag?: string;
}

export interface Stage {
  id: StageId;
  name: string;
  color: string; // Tailwind color or hex for neon branding
  description: string;
  location?: string;
}

export type ActiveTab = 'artists' | 'timetable';

export interface ClashResult {
  hasClash: boolean;
  overlappingSets: ArtistSet[];
  overlapMinutes: number;
}
