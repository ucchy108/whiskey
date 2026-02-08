import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, MiddlePage, LastPage } from './Pagination.stories';

describe('Pagination', () => {
  it('全ページボタンが表示される', () => {
    render(<Default.Component />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: `ページ${i}` })).toBeInTheDocument();
    }
  });

  it('最初のページで「前のページ」ボタンが無効', () => {
    render(<Default.Component />);

    expect(screen.getByRole('button', { name: '前のページ' })).toBeDisabled();
  });

  it('最後のページで「次のページ」ボタンが無効', () => {
    render(<LastPage.Component />);

    expect(screen.getByRole('button', { name: '次のページ' })).toBeDisabled();
  });

  it('ページ番号クリックで onPageChange が呼ばれる', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Default.Component onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'ページ3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('次のページボタンクリックで onPageChange が呼ばれる', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <MiddlePage.Component onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole('button', { name: '次のページ' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
