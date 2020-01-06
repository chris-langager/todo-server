import { wrapWith } from '../../lib/Core';

import { authentication } from './wrappers/authentication';

import { listTodos } from './listTodos';
import { upsertTodos } from './upsertTodos';

const core = {
  //todos
  listTodos,
  upsertTodos,
};

export default wrapWith(core, authentication);
