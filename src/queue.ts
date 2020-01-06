import { db } from './postgres/db';
import { promisify } from 'util';
const sleep = promisify(setTimeout);

import * as pgPromise from 'pg-promise';
const pgp = pgPromise();
const QueryResultError = pgp.errors.QueryResultError;

const EVENT_TABLE = 'event_log';

const get_next_even_query = `
select *
from ${EVENT_TABLE}
where consumed_by & (select id from consumers where name = $1) = 0
order by id ASC
limit $2
for update skip locked;
 `;

const commit_id_query = `
update ${EVENT_TABLE}
set consumed_by=(consumed_by::bit(16)  | (select id from consumers where name = $(consumer))::bit(16))::integer
where id in ($(ids:csv));
 `;

interface Payload {
  type: string;
  to: string;
}

interface Event {
  id: number;
  payload: Payload;
  consumed_by: number;
}

//TODO - use pg in stead of pg-promise ?
//TOOD - make writer
//TODO - generator implementation?
//TODO - function wrapping consumer creation

export async function write(events: Event[]) {
  const columnSet = new pgp.helpers.ColumnSet(
    [{ name: 'id' }, { name: 'payload' }, { name: 'consumed_by' }],
    { table: EVENT_TABLE }
  );

  if (events.length === 0) {
    return;
  }

  await db.none(pgp.helpers.insert(events, columnSet));
}

interface GetReadGeneratorInput {
  offset?: number;
  limit?: number;
  consumer?: string;
}

async function* getReadGenerator(input: GetReadGeneratorInput = {}) {
  const { consumer } = input;

  const query =
    `
SELECT *
FROM ${EVENT_TABLE}
WHERE id >= $(offset)
${
  consumer
    ? `AND consumed_by & (select id from consumers where name = $(consumer)) = 0`
    : ''
}
ORDER BY id ASC
LIMIT $(limit)
${consumer ? `FOR NO KEY UPDATE SKIP LOCKED` : ''}` + ';';

  const limit = input.limit || 200;
  let offset = input.offset || 1;
  while (true) {
    try {
      console.log('starting transaction....');
      await db.none('BEGIN');

      console.log('querying for events...');
      const events = await db.manyOrNone<Event>(query, { offset, limit, consumer });

      if (!events || events.length === 0) {
        console.log('breaking!');
        break;
      }

      console.log('yielding events...');
      yield events;

      if (consumer) {
        console.log('running commit query...');
        await db.none(commit_id_query, {
          consumer,
          ids: events.map(({ id }) => id),
        });
      }

      console.log('committing...');
      await db.none('COMMIT');

      offset += events ? events.length : 0;
    } catch (e) {
      console.log(e);
      console.log('rolling back...');
      await db.none('ROLLBACK');
      console.log('throwing!');
      throw e;
    }
  }
}

interface ConsumeInput {
  consumer: string;
  handleEvents: (events: Event[]) => Promise<void>;
}
async function consume2(input: ConsumeInput) {
  const { consumer, handleEvents } = input;
  try {
    //TODO: make sure consumer exists in table

    const sequence = getReadGenerator({ offset: 1, consumer, limit: 5 });
    for await (const events of sequence) {
      await handleEvents(events);
    }

    //TODO: go into some state where this checks in for new events
    console.log(`consumer ${consumer} is done!`);
  } catch (e) {
    // console.log(e);
    console.log(`consumer ${consumer} has crashed`);
  }
}

(async () => {
  consumeTest('A');
  //   await sleep(500);
  consumeTest('A');
  //   await sleep(500);
  //   consumeTest('A');
  //   await sleep(500);
  //   consumeTest('A');
})();

function consumeTest(consumer: string) {
  consume2({
    consumer,
    handleEvents: async events => {
      console.log(
        `consumer ${consumer} is handing events ${events[0].id}-${
          events[events.length - 1].id
        }`
      );
      await sleep(1000);
    },
  });
}

//getReadGeneratorExample
// (async () => {
//   const sequence = getReadGenerator({ offset: 1, consumer: 'A' });
//   //   const sequence = getReadGenerator({ offset: 1 });

//   let count = 0;
//   for await (const events of sequence) {
//     count++;
//     console.log(
//       'working on id = ',
//       events.map(({ id }) => id)
//     );
//     if (count > 1) {
//       throw new Error('asdf');
//     }
//   }
//   console.log('done!');
// })();

interface ConsumerOptions {
  name: string;
  size: number;
}
export async function consume({ name, size }) {
  let more = true;
  while (more) {
    await db
      .tx(async tx => {
        try {
          const eventRows: Event[] = await tx.many(get_next_even_query, [name, size]);
          const ids = eventRows.map(({ id }) => id);
          console.log(`[${name}] working on event ${ids}...`);
          await sleep(1000);
          console.log(`[${name}] done with event ${ids}.`);
          await tx.none(commit_id_query, { consumer: name, ids });
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

// consume({ name: 'B', size: 10 });
// consume({ name: 'B', size: 10 });
// consume({ name: 'B', size: 10 });
// consume({ name: 'B', size: 10 });
// consume({ name: 'C', size: 10 });
