import { Event } from '../events';
import { db } from './db';
import * as pgPromise from 'pg-promise';
import { Context } from '../context';
const pgp = pgPromise();

const columnSet = new pgp.helpers.ColumnSet(
  [
    { name: 'date_time', prop: 'date' },
    { name: 'event_type', prop: 'type' },
    { name: 'aggregate_type', prop: 'aggregateType' },
    { name: 'aggregate_id', prop: 'aggregateId' },
    { name: 'actor' },
    { name: 'payload' },
  ],
  { table: 'events' }
);

export async function insertEvents(ctx: Context, data: Event[]) {
  if (data.length === 0) {
    return;
  }
  await db.none(pgp.helpers.insert(data, columnSet));
  return {};
}
