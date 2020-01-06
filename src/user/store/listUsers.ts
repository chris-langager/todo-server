import { User } from '../types';
import { db } from '../../postgres/db';
import { Context } from '../../context';
import { last, first } from 'lodash';
import { Filters, FilterMapping, buildWhereClause } from '../../postgres/where';
import { encode, decode } from './cursor';

interface Row {
  id: string;
  date_created: string;
  date_updated: string;
  email: string;
}

const mappings: FilterMapping[] = [
  {
    jsonProperty: 'ids',
    sqlProperty: 'id',
    operator: 'IN',
  },
  {
    jsonProperty: 'emails',
    sqlProperty: 'email',
    operator: 'IN',
  },
  {
    jsonProperty: 'cursorId',
    sqlProperty: 'id',
    operator: '>',
  },
];

export interface Input {
  where?: ListUsersFilters;
  cursor?: string;
}

export interface ListUsersFilters extends Filters {
  ids?: string[];
  emails?: string[];
}

export async function listUsers(ctx: Context, input: Input) {
  const cursor = input.cursor && decode(input.cursor);

  const filters = input.where || {};
  if (cursor) {
    filters['cursorId'] = cursor.id;
  }

  const { where, bindVars } = buildWhereClause({
    filters,
    mappings,
  });

  const query = `
SELECT *
FROM users
${where}
ORDER BY id asc
LIMIT 500;
`;

  const rows = await db.any<Row>(query, bindVars);

  const users = rows.map(parseRow);
  return {
    users,
    pageInfo: {
      endCursor: last(users) && last(users).cursor,
      hasNextPage: users.length !== 0, //TODO: figure this out
      hasPreviousPage: undefined, //TODO: figure this out
      startCursor: first(users) && first(users).cursor,
    },
  };
}

function parseRow(row: Row): User {
  return {
    id: row.id,
    dateCreated: new Date(row.date_created),
    dateUpdated: new Date(row.date_updated),
    email: row.email,

    cursor: encode({ id: row.id }),
  };
}
