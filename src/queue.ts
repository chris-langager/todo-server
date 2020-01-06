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
limit 1
for update skip locked;
 `;

const commit_id_query = `
update event_log
set consumed_by=(consumed_by::bit(16)  | (select id from consumers where name = $1)::bit(16))::integer
where id = $2;
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

async function consume(name: string) {
  for (let i = 0; i < 50; i++) {
    await db
      .tx(async tx => {
        try {
          const { id }: EventRow = await tx.one(get_next_even_query, name);
          console.log(`[${name}] working on event ${id}...`);
          await sleep(1000);
          console.log(`[${name}] done with event ${id}.`);
          await tx.none(commit_id_query, [name, id]);
          return id;
        } catch (err) {
          if (err instanceof QueryResultError) {
            if (err.code === pgPromise.errors.queryResultErrorCode.noData) {
              return -1;
            }
          }
          throw err;
        }
      })
      .then(id => {
        console.log(`[${name}] ${id} was committed!`);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

consume('A');
consume('A');
consume('A');
consume('B');
consume('C');
consume('C');
