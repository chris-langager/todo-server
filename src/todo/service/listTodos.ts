import { CoreFunction } from '../../lib/Core';
import { values } from 'lodash';
import { Context } from '../../context';
import * as Store from '../store';
import { TodoAggregate, fromEvents } from '../aggregate';

export interface Input {}

export interface Output {
  todos: TodoAggregate[];
}

export const listTodos: CoreFunction<Context, Input, Output> = async (ctx, input) => {
  const actor = ctx.claims.id;

  const { events } = await Store.listEvents(ctx, {
    where: {
      actors: [actor],
      aggregateTypes: ['todo'],
    },
  });

  const todosById = fromEvents(events);

  return {
    todos: values(todosById),
  };
};
