import preview from '../../../../../.storybook/preview';
import { SummaryRow } from './SummaryRow';

const meta = preview.meta({
  component: SummaryRow,
  title: 'workout/SummaryRow',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    label: 'エクササイズ',
    value: 'ベンチプレス',
  },
});

export const Highlight = meta.story({
  args: {
    label: '推定1RM',
    value: '107 kg',
    highlight: true,
  },
});
