import { promisify } from 'util';
const sleep = promisify(setTimeout);

import { Pool } from 'pg';
import { CONFIG } from './config';

import { BookmarkManager } from './BookmarkManager';
import uuid = require('uuid');

const connectionString = CONFIG.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

const EVENT_TABLE = 'event_log';

interface Payload {
  type: string;
  to: string;
}

interface Event {
  id: number;
  payload: Payload;
}

interface NewEvent {
  payload: Payload;
}

interface ReaderOptions {
  reader: string;
  process: (events: Event[]) => Promise<void>;
  onProcessError?: (error: Error, events: Event[]) => Promise<void>;
  limit?: number;
}

const DEFAULT_LIMIT = 100;

export async function read(options: ReaderOptions) {
  const { reader, process, onProcessError } = options;
  const limit = options.limit || DEFAULT_LIMIT;

  const bookmarkManager = await BookmarkManager({ reader, connectionString });

  async function _read() {
    const bookmark = await bookmarkManager.checkoutBookmark();
    if (!bookmark) {
      console.log(`[${reader}] no bookmarks left, sleeping for a bit...`);
      await sleep(2000);
      _read();
      return;
    }

    let bookmarkExpired = false;
    setTimeout(() => {
      bookmarkExpired = true;
    }, 10000);

    const { partition } = bookmark;
    let { index } = bookmark;

    while (!bookmarkExpired) {
      const query = `
        SELECT *
        FROM ${EVENT_TABLE}
        WHERE id > $1 AND partition = $2
        ORDER BY id ASC
        LIMIT $3;`;

      const { rows: events } = await pool.query<Event>(query, [index, partition, limit]);

      try {
        await process(events);
      } catch (e) {
        onProcessError && (await onProcessError(e, events));
        break;
      }

      index = events[events.length - 1].id;
      await bookmarkManager.updateBookmark(partition, index);
    }

    await bookmarkManager.returnBookmark();
    _read();
  }

  _read();
}

export async function write(events: NewEvent[]) {
  const parameterPlaceholders: string[] = [];
  //TODO: fix typing
  const parameters: any[] = [];
  for (let i = 1; i <= events.length; i++) {
    parameterPlaceholders.push(`($${i}, $${i + 1})`);
    parameters.push(events[i - 1].payload);
    //TODO: generate partition key
    parameters.push(1);
  }

  const query = `
  INSERT INTO ${EVENT_TABLE} (payload, partition)
VALUES  ${parameterPlaceholders.join(',')};
`;

  await pool.query(query, parameters);
}

const processAs = (consumer: string) => {
  return async (events: Event[]) => {
    console.log(
      `consumer ${consumer} is handing events ${events[0].id}-${
        events[events.length - 1].id
      }`
    );
    await sleep(1000);
    const random = Math.random();
    if (random < 0.9) {
      // throw new Error('asdf ' + random);
    }
  };
};

(async () => {
  //   setInterval(() => {
  //     write([
  //       {
  //         payload: {
  //           to: 'asdf',
  //           type: 'asdf',
  //         },
  //       },
  //     ]);
  //   }, 1000);

  // read({
  //   reader: 'A',
  //   process: processAs('A1'),
  //   onProcessError: async (error, events) => {
  //     console.log(error.stack);
  //     console.log(`failed to process ${events.length} events`);
  //   },
  // });

  const ss = [
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    uuid.v4(),
    'asdf',
    'sadf',
    'this is a long string with spaces',
    'boggle',
    'boggle',
    'boggle',
  ];
  ss.forEach(s => console.log(`${s} -> ${hash(s)}`));
})();

function hash(s: string) {
  const sumOfCharCodes = s
    .split('')
    .map(o => o.charCodeAt(0))
    .reduce((a, b) => a + b, 0);
  return (sumOfCharCodes % 9) + 1;
}
