import Typography from '@mui/material/Typography';
import preview from '../../../../../.storybook/preview';
import { SummaryRow } from '../SummaryRow';
import { WorkoutSummaryPanel } from './WorkoutSummaryPanel';

const meta = preview.meta({
  component: WorkoutSummaryPanel,
  title: 'workout/WorkoutSummaryPanel',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    children: (
      <>
        <SummaryRow label="エクササイズ" value="ベンチプレス" />
        <SummaryRow label="総セット数" value="3" />
        <SummaryRow label="総ボリューム" value="2,400 kg" />
        <SummaryRow label="推定1RM" value="107 kg" highlight />
      </>
    ),
  },
});

export const Empty = meta.story({
  args: {
    children: (
      <Typography sx={{ fontSize: 13, color: 'textMuted.main' }}>
        エクササイズを追加するとサマリーが表示されます
      </Typography>
    ),
  },
});

export const CustomTitle = meta.story({
  args: {
    title: '重量推移',
    children: (
      <Typography sx={{ fontSize: 13, color: 'textMuted.main' }}>
        グラフは今後実装予定
      </Typography>
    ),
  },
});
