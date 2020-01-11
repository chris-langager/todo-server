import { promisify } from 'util';
const sleep = promisify(setTimeout);

import { Pool } from 'pg';
import { CONFIG } from './config';

import { BookmarkManager } from './BookmarkManager';

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
  consumed_by: number;
}

interface ReaderOptions {
  consumer: string;
  process: (events: Event[]) => Promise<void>;
  onProcessError?: (events: Event[]) => Promise<void>;
  limit?: number;
}

const DEFAULT_LIMIT = 1;

export async function Reader(options: ReaderOptions) {
  const { consumer, process, onProcessError } = options;
  const limit = options.limit || DEFAULT_LIMIT;

  const bookmarkManager = await BookmarkManager({ consumer, connectionString });

  async function read() {
    const bookmark = await bookmarkManager.checkoutBookmark();
    if (!bookmark) {
      console.log(`[${consumer}] no bookmarks left, sleeping for a bit...`);
      await sleep(2000);
      return read();
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
        onProcessError && (await onProcessError(events));
        break;
      }

      index = events[events.length - 1].id;
      await bookmarkManager.updateBookmark(partition, index);
    }

    await bookmarkManager.returnBookmark();
    return read();
  }

  return {
    read,
  };
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
      throw new Error('asdf ' + random);
    }
  };
};

(async () => {
  const reader1 = await Reader({
    consumer: 'A',
    process: processAs('A1'),
    onProcessError: async events =>
      console.log(`failed to process ${events.length} events`),
  });
  const reader2 = await Reader({
    consumer: 'A',
    process: processAs('A2'),
    onProcessError: async events =>
      console.log(`failed to process ${events.length} events`),
  });

  // const reader3 = await Reader({ consumer: 'A', process: processAs('A3') });
  reader1.read();
  reader2.read();
  // reader3.read();
})();
