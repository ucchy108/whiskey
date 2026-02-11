import { authHandlers } from './auth';
import { exerciseHandlers } from './exercise';
import { workoutHandlers } from './workout';

export { authHandlers } from './auth';
export { exerciseHandlers } from './exercise';
export { workoutHandlers } from './workout';

export const handlers = [
  ...authHandlers,
  ...exerciseHandlers,
  ...workoutHandlers,
];
