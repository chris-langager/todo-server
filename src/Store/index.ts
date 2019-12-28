import { wrapWith } from '../lib/Core';
import { createUser } from './createUser';
import { authenticateUser } from './authenticateUser';

const queries = {
  createUser,
  authenticateUser
};

export { migrate } from './migrate';
export default wrapWith(queries);
