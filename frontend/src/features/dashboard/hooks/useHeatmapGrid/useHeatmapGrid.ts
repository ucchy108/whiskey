import { useMemo } from 'react';
import type { ContributionData } from '@/features/workout';
import type { DayCell, WeekColumn } from '../../types';

function scoreToLevel(score: number): number {
  if (score === 0) return 0;
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 9) return 3;
  return 4;
}

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildGrid(data: ContributionData[]): {
  weeks: WeekColumn[];
  totalContributions: number;
} {
  const scoreMap = new Map<string, number>();
  let totalContributions = 0;

  for (const d of data) {
    const dateKey = d.date.slice(0, 10);
    scoreMap.set(dateKey, d.daily_score);
    if (d.daily_score > 0) totalContributions++;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const weeks: WeekColumn[] = [];
  const current = new Date(start);

  while (current <= today) {
    const week: WeekColumn = { days: [] };

    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(current);
      dayDate.setDate(dayDate.getDate() + d);

      if (dayDate.getDate() === 1 && week.monthStart === undefined) {
        week.monthStart = dayDate.getMonth();
      }

      if (dayDate > today) {
        week.days.push(null);
      } else {
        const key = toLocalDateKey(dayDate);
        const score = scoreMap.get(key) ?? 0;
        week.days.push({
          date: dayDate,
          score,
          level: scoreToLevel(score),
        });
      }
    }

    weeks.push(week);
    current.setDate(current.getDate() + 7);
  }

  return { weeks, totalContributions };
}

export function useHeatmapGrid(data: ContributionData[]) {
  return useMemo(() => buildGrid(data), [data]);
}
