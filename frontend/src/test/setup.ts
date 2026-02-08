import '@testing-library/jest-dom/vitest';
import { beforeAll } from 'vitest';
import preview from '../../.storybook/preview';

beforeAll(preview.composed.beforeAll);
