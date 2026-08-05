import { useState, useEffect } from 'react';

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

  if (h >= 18) return (h - 18) * 60 + m;
  if (h < 6) return (h + 6) * 60 + m;
  return -1;
}
