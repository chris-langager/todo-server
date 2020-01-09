import { promisify } from 'util';
const sleep = promisify(setTimeout);

import { Pool } from 'pg';
import { CONFIG } from './config';

const pool = new Pool({
  connectionString: CONFIG.DATABASE_URL,
});

const EVENT_TABLE = 'event_log';

const commit_id_query = `
update ${EVENT_TABLE}
set consumed_by=(consumed_by::bit(16)  | (select id from consumers where name = $1)::bit(16))::integer
where id = ANY ($2);
 `;

const lock_query = `
select *
from consumers
where name = $1
for update skip locked;
`;

const checkout_bookmark = `
select *
from bookmarks
where consumer = $1
order by date_returned3 asc, index asc, partition asc
limit 1
    for update skip locked;
`;

const return_bookmark = `
update bookmarks
set index = $1, date_returned3 = $2
where consumer = $3 and partition = $4;
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

interface GetReadGeneratorInput {
  offset?: number;
  limit?: number;
  consumer?: string;
}

async function* getReadGenerator(input: GetReadGeneratorInput = {}) {
  const { consumer } = input;
  // let offset = input.offset || 1;
  let limit = input.limit || 200;

  //   const query = `
  // SELECT *
  // FROM ${EVENT_TABLE}
  // WHERE id >= $1
  // ${consumer ? `AND consumed_by & (select id from consumers where name = $3) = 0` : ''}
  // ORDER BY id ASC
  // LIMIT $2
  // ${consumer ? `FOR UPDATE SKIP LOCKED` : ''}
  // ;`;
  const query = `
SELECT *
FROM ${EVENT_TABLE}
WHERE id > $1
${consumer ? `AND partition = $3` : ''}
ORDER BY id ASC
LIMIT $2;`;

  const client = await pool.connect();
  try {
    while (true) {
      await client.query('BEGIN');

      let partition = 0;
      let offset = 0;
      if (consumer) {
        const { rows } = await client.query(checkout_bookmark, [consumer]);
        if (rows.length === 0) {
          //Consider - fire a special event indicating that there's locks already taken?
          break;
        }
        partition = rows[0].partition;
        offset = rows[0].index;
      }

      const { rows: events } = await client.query<Event>(query, [
        offset,
        limit,
        partition,
      ]);

      if (!events || events.length === 0) {
        if (consumer) {
          await client.query(return_bookmark, [offset, new Date(), consumer, partition]);
        }
        await client.query('COMMIT');
        break;
      }

      yield events;

      if (consumer) {
        await client.query(return_bookmark, [
          events[events.length - 1].id,
          new Date(),
          consumer,
          partition,
        ]);
      }

      await client.query('COMMIT');

      offset += events ? events.length : 0;
    }
  } catch (e) {
    //note - this will not be hit if the consumer of this generator has an error,
    //this is just for db errors within this function.
    //the "finally" will always be called though.
    await client.query('ROLLBACK');
    throw e;
  } finally {
    //this will always be called, even if the consumer of this generator has an error
    client.release();
  }
}

interface ConsumeInput {
  consumer?: string;
  handleEvents: (events: Event[]) => Promise<void>;
}

async function read(input: ConsumeInput) {
  const { consumer, handleEvents } = input;
  //TODO: make sure consumer exists in table

  try {
    const sequence = getReadGenerator({ consumer });

    for await (const events of sequence) {
      await handleEvents(events);
    }
  } catch (e) {
    console.log(e);
    console.log('there was an error, restarting in a bit...');
    await sleep(1000);
    return read(input);
  }

  console.log('nothing for me to read, restarting in a bit');
  await sleep(1000);
  return read(input);
}

(async () => {
  consumeTest('A');
  consumeTest('A');
  // consumeTest('A');
  // consumeTest('A');
  // consumeTest('A');
  // consumeTest('A');
  // consumeTest('A');
  // consumeTest('A');
  // consumeTest('A');
  // consumeTest('B');

  // consumeTest('A');

  // consumeTest('A');
})();

function consumeTest(consumer: string) {
  read({
    consumer,
    handleEvents: async events => {
      console.log(
        `consumer ${consumer} is handing events ${events[0].id}-${
          events[events.length - 1].id
        }`
      );
      // await sleep(1000);
      const random = Math.random();
      if (random < 0.9) {
        // throw new Error('asdf ' + random);
      }
    },
  });
}
