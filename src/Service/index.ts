import { wrapWith } from '../lib/Core';
import { createUser } from './createUser';
import { loginUser } from './loginUser';

const core = {
  createUser,
  loginUser
};

export default wrapWith(core);
