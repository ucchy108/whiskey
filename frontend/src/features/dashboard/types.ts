export interface DayCell {
  date: Date;
  score: number;
  level: number;
}

export interface WeekColumn {
  days: (DayCell | null)[];
  monthStart?: number;
}

export type PeriodFilter = '1m' | '3m' | '6m' | '1y' | 'all';
