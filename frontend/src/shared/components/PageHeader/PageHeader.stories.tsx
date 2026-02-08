import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import preview from '../../../../.storybook/preview';
import { PageHeader } from './PageHeader';

const meta = preview.meta({
  component: PageHeader,
  title: 'shared/PageHeader',
});

export default meta;

export const Default = meta.story({
  args: {
    title: 'ワークアウト履歴',
    subtitle: '過去のワークアウトを確認・管理',
  },
});

export const WithActions = meta.story({
  args: {
    title: 'ワークアウト履歴',
    subtitle: '過去のワークアウトを確認・管理',
    actions: (
      <Button
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
        sx={{ height: 44, borderRadius: '12px' }}
      >
        記録する
      </Button>
    ),
  },
});
