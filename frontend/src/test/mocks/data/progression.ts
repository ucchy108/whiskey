import type { WeightProgressionData } from '@/features/workout/types';

export function generateMockProgression(
  exerciseId: string,
  days: number = 90,
): WeightProgressionData[] {
  const data: WeightProgressionData[] = [];
  const today = new Date();
  const baseWeight = exerciseId === 'e1' ? 60 : exerciseId === 'e2' ? 80 : 100;

  for (let i = days; i >= 0; i -= 3) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const progress = ((days - i) / days) * 15;
    const variation = (Math.random() - 0.5) * 4;

    data.push({
      date: date.toISOString().slice(0, 10),
      max_1rm: Math.round((baseWeight + progress + variation) * 100) / 100,
    });
  }

  return data;
}

export const mockProgression: WeightProgressionData[] = generateMockProgression('e1');
