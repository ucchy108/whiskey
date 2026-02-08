import { render, screen } from '@testing-library/react';
import { Default, WithActions } from './PageHeader.stories';

describe('PageHeader', () => {
  it('タイトルとサブタイトルが表示される', () => {
    render(<Default.Component />);

    expect(
      screen.getByRole('heading', { name: 'ワークアウト履歴' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('過去のワークアウトを確認・管理'),
    ).toBeInTheDocument();
  });

  it('アクションボタンが表示される', () => {
    render(<WithActions.Component />);

    expect(screen.getByText('記録する')).toBeInTheDocument();
  });
});
