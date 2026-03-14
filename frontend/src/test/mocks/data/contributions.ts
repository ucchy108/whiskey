import type { ContributionData } from '@/features/workout';

export function generateMockContributions(
  days = 365,
  density = 0.4,
): ContributionData[] {
  const data: ContributionData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const i of Array.from({ length: days }, (_, idx) => days - 1 - idx)) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const hasActivity = Math.random() < density;
    const daily_score = hasActivity
      ? Math.floor(Math.random() * 15) + 1
      : 0;

    data.push({
      date: date.toISOString(),
      daily_score,
    });
  }

  return data;
}

export const mockContributions = generateMockContributions();
