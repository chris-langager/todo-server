import { db } from './db';
import { Event, AggregateType } from '../events';
import { Context } from '../context';
import { last, first } from 'lodash';
import { Filters, FilterMapping, buildWhereClause } from './where';
import { encode, decode } from './cursor';

interface Row {
  id: string;
  date_time: Date;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  actor: string;
  payload: object;
}

const mappings: FilterMapping[] = [
  {
    jsonProperty: 'aggregateTypes',
    sqlProperty: 'aggregate_type',
    operator: 'IN',
  },
  {
    jsonProperty: 'aggregateIds',
    sqlProperty: 'aggregate_id',
    operator: 'IN',
  },
  {
    jsonProperty: 'actors',
    sqlProperty: 'actor',
    operator: 'IN',
  },
  {
    jsonProperty: 'cursorId',
    sqlProperty: 'id',
    operator: '>',
  },
];

export interface Input {
  where?: ListEventsFilters;
  cursor?: string;
}

export interface ListEventsFilters extends Filters {
  aggregateTypes?: AggregateType[];
  aggregateIds?: string[];
  actors?: string[];
}

export async function listEvents(ctx: Context, input: Input) {
  const cursor = input.cursor && decode(input.cursor);

  const filters = input.where || {};
  if (cursor) {
    filters['cursorId'] = cursor.id;
  }

  const { where, bindVars } = buildWhereClause({
    filters,
    mappings,
  });

  const query = `
SELECT *
FROM events
${where}
ORDER BY id asc
LIMIT 500;
`;

  const rows = await db.any<Row>(query, bindVars);

  const events = rows.map(parseRow);
  return {
    events,
    pageInfo: {
      endCursor: last(events) && last(events).cursor,
      hasNextPage: events.length !== 0, //TODO: figure this out
      hasPreviousPage: undefined, //TODO: figure this out
      startCursor: first(events) && first(events).cursor,
    },
  };
}

function parseRow(row: Row): Event {
  return {
    id: row.id,
    date: row.date_time,
    type: row.event_type as any,
    aggregateType: row.aggregate_type as any,
    aggregateId: row.aggregate_id,
    actor: row.actor,
    payload: row.payload,

    cursor: encode({ id: row.id }),
  };
}
