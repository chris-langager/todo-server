import { CoreFunction } from '../lib/Core';
import * as uuid from 'uuid';
import { User } from '../types';
import { Context } from '../context';
import Store from '../Store';

export interface Input {
  email: string;
  password: string;
}

export interface Output {
  user: User;
}

export const createUser: CoreFunction<Context, Input, Output> = async (ctx, input) => {
  const { email, password } = input;
  const now = new Date();
  const user = {
    id: uuid.v4(),
    dateCreated: now,
    dateUpdated: now,
    email,
  };

  await Store.createUser(ctx, { user, password });

  return { user };
};
