import { pick } from 'lodash';
import { Todo } from './types';
import { TodoUpdated } from './events';
import { Event } from './events';
import { diff } from 'deep-object-diff';

export interface TodoAggregate {
  id: string;
  createdBy: string;
  dateCreated: Date;
  dateUpdated: Date;
  text: string;
  completed: boolean;
  deleted: boolean;
  history: string[];
}

export function toTodo(todoAggregate: TodoAggregate): Todo {
  return pick(todoAggregate, 'id', 'text', 'completed');
}

export function fromEvents(events: Event[]): Record<string, TodoAggregate> {
  return events
    .filter(event => event.aggregateType === 'todo')
    .reduce<Record<string, TodoAggregate>>((acc, event) => {
      acc[event.aggregateId] = project(event, acc[event.aggregateId]);
      return acc;
    }, {});
}

export function project(event: Event, state?: TodoAggregate): TodoAggregate {
  switch (event.type) {
    case 'TodoCreated': {
      return {
        ...event.payload.newRecord,
        createdBy: event.actor,
        dateCreated: event.date,
        dateUpdated: event.date,
        deleted: false,
        history: [
          `${event.actor} created todo with text ${event.payload.newRecord.text}`,
        ],
      };
    }
    case 'TodoUpdated': {
      return {
        ...state,
        ...event.payload.newRecord,
        dateUpdated: event.date,
        history: [...state.history, getHistoryForUpdate(event)],
      };
    }
    case 'TodoDeleted': {
      return {
        ...state,
        dateUpdated: event.date,
        deleted: true,
        history: [...state.history, `${event.actor} deleted todo`],
      };
    }
  }
}

function getHistoryForUpdate(event: TodoUpdated): string {
  const changes = diff(event.payload.oldRecord, event.payload.newRecord);
  return `${event.actor} updated ${Object.keys(changes)
    .map(key => {
      const oldVal = event.payload.oldRecord[key];
      const newVal = event.payload.newRecord[key];
      return `${key} from '${oldVal}' to '${newVal}'`;
    })
    .join(', ')}`;
}
