import type { ArtistSet, ClashResult } from '../types';

/**
 * Converts "HH:MM" to continuous minutes since 16:00.
 * Hours < 12 are treated as next-day (e.g. 02:00 = 10 hours after 16:00 = 600 min).
 * 16:00 → 0, 18:00 → 120, 00:00 → 480, 06:00 → 840
 */
export function timeToMinutes(timeStr: string): number {
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (hours < 12) {
    hours += 24;
  }

  return (hours * 60 + minutes) - (16 * 60);
}

export function minutesToTime(minutes: number): string {
  const totalMins = minutes + (16 * 60);
  let h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function doSetsOverlap(set1: ArtistSet, set2: ArtistSet): { overlaps: boolean; minutes: number } {
  if (set1.id === set2.id || set1.day !== set2.day) {
    return { overlaps: false, minutes: 0 };
  }

  const start1 = timeToMinutes(set1.startTime);
  const end1 = timeToMinutes(set1.endTime);
  const start2 = timeToMinutes(set2.startTime);
  const end2 = timeToMinutes(set2.endTime);

  if (end1 <= start2 || start1 >= end2) {
    return { overlaps: false, minutes: 0 };
  }

  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  return { overlaps: true, minutes: Math.max(0, overlapEnd - overlapStart) };
}

export function checkSetClash(targetSet: ArtistSet, favoriteSets: ArtistSet[]): ClashResult {
  const overlapping: ArtistSet[] = [];
  let maxOverlapMinutes = 0;

  for (const fav of favoriteSets) {
    if (fav.id === targetSet.id) continue;
    const { overlaps, minutes } = doSetsOverlap(targetSet, fav);
    if (overlaps) {
      overlapping.push(fav);
      if (minutes > maxOverlapMinutes) maxOverlapMinutes = minutes;
    }
  }

  return {
    hasClash: overlapping.length > 0,
    overlappingSets: overlapping,
    overlapMinutes: maxOverlapMinutes,
  };
}
