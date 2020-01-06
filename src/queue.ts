import { db } from './postgres/db';
import { promisify } from 'util';
const sleep = promisify(setTimeout);

import * as pgPromise from 'pg-promise';
const pgp = pgPromise();
const QueryResultError = pgp.errors.QueryResultError;

const get_next_even_query = `
select *
from event_log
where consumed_by & (select id from consumers where name = $1) = 0
order by id ASC
limit $2
for update skip locked;
 `;

const commit_id_query = `
update event_log
set consumed_by=(consumed_by::bit(16)  | (select id from consumers where name = $1)::bit(16))::integer
where id in ($2:csv);
 `;

interface Payload {
  type: string;
  to: string;
}

interface EventRow {
  id: number;
  payload: Payload;
  consumed_by: number;
}

//TODO - use pg in stead of pg-promise
//TOOD - make producer
//TOOD - batch consumer
//TODO - generator implementation?
//TODO - function wrapping consumer creation

interface ConsumerOptions {
  name: string;
  size: number;
}
async function consume({ name, size }) {
  let more = true;
  while (more) {
    await db
      .tx(async tx => {
        try {
          const eventRows: EventRow[] = await tx.many(get_next_even_query, [name, size]);
          const ids = eventRows.map(({ id }) => id);
          console.log(`[${name}] working on event ${ids}...`);
          await sleep(1000);
          console.log(`[${name}] done with event ${ids}.`);
          await tx.none(commit_id_query, [name, ids]);
          return ids;
        } catch (err) {
          if (err instanceof QueryResultError) {
            if (err.code === pgPromise.errors.queryResultErrorCode.noData) {
              more = false;
              return -1;
            }
          }
          throw err;
        }
      })
      .then(ids => {
        if (!more) {
          return;
        }
        console.log(`[${name}] ${ids} were committed!`);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

consume({ name: 'B', size: 10 });
consume({ name: 'B', size: 10 });
consume({ name: 'B', size: 10 });
consume({ name: 'B', size: 10 });
consume({ name: 'C', size: 10 });
