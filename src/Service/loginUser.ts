import { CoreFunction } from '../lib/Core';
import { pick } from 'lodash';
import { User } from '../types';
import { Context } from '../context';
import Store from '../Store';
import { createUserAccessToken } from '../tokens';

export interface Input {
  email: string;
  password: string;
}

export interface Output {
  user: User;
  accessToken: string;
}

export const loginUser: CoreFunction<Context, Input, Output> = async (ctx, input) => {
  const { email, password } = input;

  const { user } = await Store.authenticateUser(ctx, { email, password });

  if (!user) {
    throw new Error('incorrect username or password');
  }

  return {
    user,
    accessToken: createUserAccessToken(pick(user, 'id', 'email')),
  };
};
