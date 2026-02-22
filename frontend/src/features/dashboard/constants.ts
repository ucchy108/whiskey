export const CELL_SIZE = 12;
export const CELL_GAP = 3;

export const HEATMAP_LEVEL_KEYS = [
  'heatmap.level0',
  'heatmap.level1',
  'heatmap.level2',
  'heatmap.level3',
  'heatmap.level4',
] as const;

export const DAY_LABELS = ['', '月', '', '水', '', '金', ''] as const;

export const MONTH_LABELS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
] as const;

export const PERIOD_OPTIONS = [
  { label: '1ヶ月', value: '1m' as const, days: 30 },
  { label: '3ヶ月', value: '3m' as const, days: 90 },
  { label: '6ヶ月', value: '6m' as const, days: 180 },
  { label: '1年', value: '1y' as const, days: 365 },
  { label: '全期間', value: 'all' as const, days: null },
] as const;
