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
import { EventEmitter } from 'events';
import { emit } from 'cluster';

class Reader extends EventEmitter {
  private bookmarkExpired: boolean = false;
  private process: (events: Event[]) => Promise<void>;

  constructor(process: (events: Event[]) => Promise<void>) {
    super();

    this.process = process;
    const self = this;

    this.on('bookmarkCheckedOut', this.setTimerOnBookmark);
    this.on('bookmarkCheckedOut', this.read);
    this.on('bookmarkReturned', this.onBookmarkReturned);
    this.on('read', async function(events) {
      await self.process(events);
      //updateBookmark
    });
  }

  start() {
    console.log('starting up!');
    //checkout bookmark
    this.checkoutBookmark();
  }

  setTimerOnBookmark() {
    setTimeout(() => {
      this.bookmarkExpired = true;
    }, 5000);
  }

  read() {
    //go to the db for some stuff
    const events: Event[] = [
      {
        id: 1,
        payload: {
          type: 'w/e',
          to: 'who ever',
        },
        consumed_by: 123,
      },
    ];
    this.emit('read', events);
  }

  async onBookmarkReturned() {
    console.log('onBokmarkReturned');
    console.log('sleeping for a bit...');
    await sleep(2000);
    this.checkoutBookmark();
  }

  checkoutBookmark() {
    const bookmark = 1;
    if (!bookmark) {
      this.emit('noBookmark');
      return;
    }

    this.emit('bookmarkCheckedOut');
  }

  returnBookmark() {
    this.emit('bookmarkReturned');
  }
}

(async () => {
  const reader = new Reader(async events => {
    console.log(`processing ${events[0].id}-${events[events.length - 1].id}`);
    await sleep(1000);
  });

  reader.start();
})();
