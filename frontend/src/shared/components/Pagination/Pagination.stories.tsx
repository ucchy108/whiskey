import preview from '../../../../.storybook/preview';
import { Pagination } from './Pagination';

const meta = preview.meta({
  component: Pagination,
  title: 'shared/Pagination',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    currentPage: 1,
    totalPages: 5,
    onPageChange: () => {},
  },
});

export const MiddlePage = meta.story({
  args: {
    currentPage: 3,
    totalPages: 5,
    onPageChange: () => {},
  },
});

export const LastPage = meta.story({
  args: {
    currentPage: 5,
    totalPages: 5,
    onPageChange: () => {},
  },
});
