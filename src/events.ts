import { Todo } from './types';

export type AggregateType = 'todo';

interface EventBase {
  id?: string;
  date: Date;
  type: string;
  aggregateType: AggregateType;
  aggregateId: string;
  actor: string;
  payload: object;

  cursor?: string;
}

export interface TodoCreated extends EventBase {
  type: 'TodoCreated';
  aggregateType: 'todo';
  payload: {
    newRecord: Todo;
  };
}

export interface TodoUpdated extends EventBase {
  type: 'TodoUpdated';
  aggregateType: 'todo';
  payload: {
    oldRecord: Todo;
    newRecord: Todo;
  };
}

export interface TodoDeleted extends EventBase {
  type: 'TodoDeleted';
  aggregateType: 'todo';
  payload: {};
}

export type Event = TodoCreated | TodoUpdated | TodoDeleted;

//TODO: find a way to make this generic and typesafe
export interface EventsByType {
  TodoCreated: TodoCreated[];
  TodoUpdated: TodoUpdated[];
  TodoDeleted: TodoDeleted[];
}

export function byType(events: Event[]): EventsByType {
  return events.reduce(
    (acc, event) => {
      //@ts-ignore
      acc[event.type].push(event);

      return acc;
    },
    {
      TodoCreated: [],
      TodoUpdated: [],
      TodoDeleted: [],
    } as EventsByType
  );
}
