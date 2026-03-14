import type { WeightProgressionData } from '@/features/workout/types';

export function generateMockProgression(
  exerciseId: string,
  days: number = 90,
): WeightProgressionData[] {
  const data: WeightProgressionData[] = [];
  const today = new Date();
  const baseWeight = exerciseId === 'e1' ? 60 : exerciseId === 'e2' ? 80 : 100;

  for (const i of Array.from({ length: Math.ceil((days + 1) / 3) }, (_, idx) => days - idx * 3).filter((v) => v >= 0)) {
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
