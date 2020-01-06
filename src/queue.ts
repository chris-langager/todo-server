import { db } from './postgres/db';
import { promisify } from 'util';
const sleep = promisify(setTimeout);

import * as pgPromise from 'pg-promise';
import pg = require('pg-promise/typescript/pg-subset');
const pgp = pgPromise();
const QueryResultError = pgp.errors.QueryResultError;

const get_next_even_query = `
select *
from event_log
where consumed_by = 0
order by id ASC
limit 1
for update skip locked;
 `;

const commit_id_query = `
update event_log
set consumed_by=1
where id = $1;
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
          const { id }: EventRow = await tx.one(get_next_even_query);
          console.log(`[${name}] working on event ${id}...`);
          await sleep(1000);
          console.log(`[${name}] done with event ${id}.`);
          await tx.none(commit_id_query, id);
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
consume('B');
