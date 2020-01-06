import { diff } from 'deep-object-diff';
import { CoreFunction } from '../../lib/Core';
import { pick } from 'lodash';
import uuid = require('uuid');
import { TodoCreated, TodoUpdated } from '../events';
import { Context } from '../../context';
import * as Store from '../store';
import { fromEvents, toTodo } from '../aggregate';
import { handleEvents } from '../../eventHandler';

export interface Input {
  upsertTodoInputs: UpsertTodoInput[];
}
export interface UpsertTodoInput {
  id?: string;
  text: string;
  completed: boolean;
}

export interface Output {}

export const upsertTodos: CoreFunction<Context, Input, Output> = async (ctx, input) => {
  const actor = ctx.claims.id;
  const { upsertTodoInputs } = input;

  const { events: existingEvents } = await Store.listEvents(ctx, {
    where: {
      actors: [actor],
      aggregateTypes: ['todo'],
      aggregateIds: upsertTodoInputs.map(({ id }) => id),
    },
  });

  const existingTodos = fromEvents(existingEvents);

  const newEvents = upsertTodoInputs
    .map(upsertTodoInput => ({
      ...upsertTodoInput,
      id: upsertTodoInput.id ? upsertTodoInput.id : uuid.v4(),
    }))
    .map(upsertTodoInput => {
      const { id } = upsertTodoInput;
      const existingTodo = existingTodos[id];

      //new todo - go ahead and create it
      if (!existingTodo) {
        return newTodoCreated(ctx, { newRecord: upsertTodoInput });
      }

      //make sure the user has permissions to modify the existing todo
      if (existingTodo.createdBy !== actor) {
        throw new Error('cannot update a Todo that you are not the creator of');
      }

      //check for changes
      const changes = diff(
        pick(existingTodo, 'text', 'completed'),
        pick(upsertTodoInput, 'text', 'completed')
      );

      if (Object.keys(changes).length === 0) {
        //nothing has changed, so nothing to do here
        return null;
      }

      //something has changed, so make the update event
      return newTodoUpdated(ctx, {
        oldRecord: toTodo(existingTodo),
        newRecord: upsertTodoInput,
      });
    })
    .filter(o => !!o);

  await handleEvents(ctx, { events: newEvents });

  return {};
};

function newTodoCreated(ctx: Context, payload: TodoCreated['payload']): TodoCreated {
  return {
    id: uuid.v4(),
    date: new Date(),
    type: 'TodoCreated',
    aggregateType: 'todo',
    aggregateId: payload.newRecord.id,
    actor: ctx.claims.id,
    payload,
  };
}

function newTodoUpdated(ctx: Context, payload: TodoUpdated['payload']): TodoUpdated {
  return {
    id: uuid.v4(),
    date: new Date(),
    type: 'TodoUpdated',
    aggregateType: 'todo',
    aggregateId: payload.newRecord.id,
    actor: ctx.claims.id,
    payload,
  };
}
