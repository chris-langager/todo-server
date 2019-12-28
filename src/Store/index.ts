import { wrapWith } from '../lib/Core';
import { createUser } from './createUser';
import { authenticateUser } from './authenticateUser';
import { listEvents } from './listEvents';

const core = {
  createUser,
  authenticateUser,
  listEvents,
};

export { migrate } from './migrate';
export { handleEvents } from './handleEvents';
export default wrapWith(core);
