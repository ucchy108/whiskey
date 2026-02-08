import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithSearch } from './WorkoutFilterBar.stories';

describe('WorkoutFilterBar', () => {
  it('検索フィールドとフィルターが表示される', () => {
    render(<Default.Component />);

    expect(
      screen.getByPlaceholderText('ワークアウトを検索...'),
    ).toBeInTheDocument();
    expect(screen.getByText('全エクササイズ')).toBeInTheDocument();
  });

  it('検索入力で onSearchChange が呼ばれる', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<Default.Component onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText('ワークアウトを検索...');
    await user.type(input, 'ベンチ');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('検索クエリが表示される', () => {
    render(<WithSearch.Component />);

    expect(screen.getByDisplayValue('ベンチ')).toBeInTheDocument();
  });
});
