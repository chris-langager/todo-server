import { CoreFunction } from '../../lib/Core';

import { User } from '../types';
import { Context } from '../../context';
import * as Store from '../store';
import { validateUserAccessToken } from '../../tokens';

export interface Input {}

export interface Output {
  user: User;
}

export const getSelf: CoreFunction<Context, Input, Output> = async (ctx, input) => {
  const { token } = ctx;
  if (!token) {
    //this could be replaced with creating an "partial" user and returning it + setting
    return null;
  }

  const claims = validateUserAccessToken(token);
  return Store.getUserById(ctx, { id: claims.id });
};
