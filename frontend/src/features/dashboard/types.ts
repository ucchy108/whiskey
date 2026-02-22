export interface DayCell {
  date: Date;
  score: number;
  level: number;
}

export interface WeekColumn {
  days: (DayCell | null)[];
  monthStart?: number;
}
