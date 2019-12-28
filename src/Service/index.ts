import { wrapWith } from '../lib/Core';

import { authentication } from './wrappers/authentication';

import { createUser } from './createUser';
import { loginUser } from './loginUser';

import { listTodos } from './listTodos';
import { upsertTodos } from './upsertTodos';

const core = {
  //users
  createUser,
  loginUser,

  //todos
  listTodos,
  upsertTodos,
};

export default wrapWith(core, authentication);
