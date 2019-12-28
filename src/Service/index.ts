import { wrapWith } from '../lib/Core';

import { authentication } from './wrappers/authentication';

import { createUser } from './createUser';
import { loginUser } from './loginUser';

const core = {
  createUser,
  loginUser,
};

export default wrapWith(core, authentication);
