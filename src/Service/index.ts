import { wrapWith } from '../lib/Core';

import { authentication } from './wrappers/authentication';

import { createUser } from './createUser';
import { loginUser } from './loginUser';
import { loginWithGoogle } from './loginWithGoogle';

import { listTodos } from './listTodos';
import { upsertTodos } from './upsertTodos';

const core = {
  //users
  createUser,
  loginUser,
  loginWithGoogle,

  //todos
  listTodos,
  upsertTodos,
};

export default wrapWith(core, authentication);
