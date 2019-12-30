import { wrapWith } from '../lib/Core';
import { createUser } from './createUser';
import { authenticateUser } from './authenticateUser';
import { listEvents } from './listEvents';
import { getUserByEmail, getUserById } from './getUser';

const core = {
  createUser,
  authenticateUser,
  getUserByEmail,
  getUserById,
  listEvents,
};

export { migrate } from './migrate';
export { handleEvents } from './handleEvents';
export default wrapWith(core);
