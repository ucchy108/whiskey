import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { PeriodFilter as PeriodFilterType } from '../../types';
import { PERIOD_OPTIONS } from '../../constants';

export interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (period: PeriodFilterType) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: PeriodFilterType | null,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      data-testid="period-filter"
    >
      {PERIOD_OPTIONS.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          sx={{
            fontSize: 12,
            textTransform: 'none',
          }}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
