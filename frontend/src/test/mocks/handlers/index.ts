import { authHandlers } from './auth';
import { exerciseHandlers } from './exercise';
import { profileHandlers } from './profile';
import { workoutHandlers } from './workout';

export { authHandlers } from './auth';
export { exerciseHandlers } from './exercise';
export { profileHandlers } from './profile';
export { workoutHandlers } from './workout';

export const handlers = [
  ...authHandlers,
  ...exerciseHandlers,
  ...profileHandlers,
  ...workoutHandlers,
];
