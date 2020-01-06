import { wrapWith } from '../../lib/Core';

import { createUser } from '../../user/service/createUser';
import { loginUser } from '../../user/service/loginUser';
import { loginWithGoogle } from '../../user/service/loginWithGoogle';
import { getSelf } from '../../user/service/getSelf';

const core = {
  //users
  createUser,
  loginUser,
  loginWithGoogle,
  getSelf,
};

export default wrapWith(core);
