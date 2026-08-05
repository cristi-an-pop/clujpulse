import type { ArtistSet, ClashResult } from '../types';

/**
 * Converts a 24h time string like "20:30" or "02:00" to continuous minutes since 18:00.
 * Any hour below 12 is assumed to belong to the next early morning (i.e. hour + 24).
 * 18:00 -> 0 minutes
 * 00:00 -> 360 minutes (6 hours later)
 * 06:00 -> 720 minutes (12 hours later)
 */
export function timeToMinutes(timeStr: string): number {
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (hours < 12) {
    hours += 24;
  }

  // Offset from 18:00 (18 * 60 = 1080)
  const totalMinutes = (hours * 60 + minutes) - (18 * 60);
  return totalMinutes;
}

/**
 * Converts continuous minutes from 18:00 back to a formatted string e.g. "01:30"
 */
export function minutesToTime(minutes: number): string {
  const totalMins = minutes + (18 * 60);
  let h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Checks if two artist sets overlap in time on the same day.
 */
export function doSetsOverlap(set1: ArtistSet, set2: ArtistSet): { overlaps: boolean; minutes: number } {
  if (set1.id === set2.id || set1.day !== set2.day) {
    return { overlaps: false, minutes: 0 };
  }

  const start1 = timeToMinutes(set1.startTime);
  const end1 = timeToMinutes(set1.endTime);
  const start2 = timeToMinutes(set2.startTime);
  const end2 = timeToMinutes(set2.endTime);

  // Check intersection
  if (end1 <= start2 || start1 >= end2) {
    return { overlaps: false, minutes: 0 };
  }

  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const duration = Math.max(0, overlapEnd - overlapStart);

  return { overlaps: true, minutes: duration };
}

/**
 * Analyzes an artist set against a list of favorited artist sets to detect clashes.
 */
export function checkSetClash(targetSet: ArtistSet, favoriteSets: ArtistSet[]): ClashResult {
  const overlapping: ArtistSet[] = [];
  let maxOverlapMinutes = 0;

  for (const fav of favoriteSets) {
    if (fav.id === targetSet.id) continue;
    const { overlaps, minutes } = doSetsOverlap(targetSet, fav);
    if (overlaps) {
      overlapping.push(fav);
      if (minutes > maxOverlapMinutes) {
        maxOverlapMinutes = minutes;
      }
    }
  }

  return {
    hasClash: overlapping.length > 0,
    overlappingSets: overlapping,
    overlapMinutes: maxOverlapMinutes,
  };
}
