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
  const limit = input.limit || 200;
  let offset = input.offset || 1;

  const query =
    `
SELECT *
FROM ${EVENT_TABLE}
WHERE id >= $1
${consumer ? `AND consumed_by & (select id from consumers where name = $3) = 0` : ''}
ORDER BY id ASC
LIMIT $2
${consumer ? `FOR NO KEY UPDATE SKIP LOCKED` : ''}` + ';';

  const client = await pool.connect();
  try {
    while (true) {
      console.log('starting transaction....');
      await client.query('BEGIN');

      console.log('querying for events...');
      const { rows: events } = await client.query<Event>(query, [
        offset,
        limit,
        consumer,
      ]);
      if (!events || events.length === 0) {
        console.log('breaking!');
        break;
      }

      console.log('yielding events...');
      yield events;

      if (consumer) {
        console.log('running commit query...');
        await client.query(commit_id_query, [consumer, events.map(({ id }) => id)]);
      }

      console.log('committing...');
      await client.query('COMMIT');

      offset += events ? events.length : 0;
    }
  } catch (e) {
    console.log(e);
    console.log('rolling back...');
    await client.query('ROLLBACK');
    console.log('throwing!');
    throw e;
  } finally {
    console.log('release called');
    client.release();
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
    console.log(e);
    console.log(`consumer ${consumer} has crashed`);
    throw e;
  }
}

(async () => {
  consumeTest('A');

  consumeTest('A');
  consumeTest('A');
  consumeTest('A');
  consumeTest('A');
  consumeTest('A');
  consumeTest('A');
  consumeTest('A');
  consumeTest('A');
  consumeTest('B');

  consumeTest('A');

  consumeTest('A');
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
