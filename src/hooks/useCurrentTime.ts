import { useState, useEffect } from 'react';

const FESTIVAL_DAYS: Record<number, number> = {
  6: 1,  // Aug 6 = Day 1
  7: 2,  // Aug 7 = Day 2
  8: 3,  // Aug 8 = Day 3
  9: 4,  // Aug 9 = Day 4
};

export function useFestivalDay(): number | null {
  const [day, setDay] = useState<number | null>(getFestivalDay);

  useEffect(() => {
    const interval = setInterval(() => setDay(getFestivalDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return day;
}

function getFestivalDay(): number | null {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed, August = 7
  const date = now.getDate();
  const hour = now.getHours();

  if (month !== 7) return null; // Not August

  // Festival runs 16:00 to 06:00 next day
  // If it's between midnight and 6am, we're still on the previous calendar day's festival day
  if (hour < 6) {
    const prevDate = date - 1;
    return FESTIVAL_DAYS[prevDate] ?? null;
  }

  return FESTIVAL_DAYS[date] ?? null;
}

export function useCurrentTime(): number {
  const [minutes, setMinutes] = useState(computeFestivalMinutes);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(computeFestivalMinutes());
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  return minutes;
}

export function useClockTime(): string {
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime());
    }, 1_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function computeFestivalMinutes(): number {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  // Matches timeToMinutes: 16:00 = 0, 00:00 = 480, 06:00 = 840
  if (h >= 16) return (h - 16) * 60 + m;
  if (h < 6) return (h + 8) * 60 + m;
  return -1;
}
