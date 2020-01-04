import { CoreFunction } from '../lib/Core';
import * as uuid from 'uuid';
import { User } from '../types';
import { Context } from '../context';
import Store from '../Store';

export interface Input {}

export interface Output {
  user: User;
}

export const getSelf: CoreFunction<Context, Input, Output> = async (ctx, input) => {
  return Store.getUserById(ctx, { id: ctx.claims.id });
};
