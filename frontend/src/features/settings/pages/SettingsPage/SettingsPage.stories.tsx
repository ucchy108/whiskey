import { MemoryRouter } from 'react-router';
import preview from '../../../../../.storybook/preview';
import { SettingsPage } from './SettingsPage';

const meta = preview.meta({
  component: SettingsPage,
  title: 'settings/SettingsPage',
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
});

export default meta;

export const Default = meta.story({});
