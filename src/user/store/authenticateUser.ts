import { db } from '../../postgres/db';
import { Context } from '../../context';
import { User } from '../types';

export interface Input {
  email: string;
  password: string;
}
export interface Output {
  user: User | null;
}

export async function authenticateUser(ctx: Context, input: Input): Promise<Output> {
  const query = `
SELECT * 
FROM users 
WHERE email = lower($(email)) 
  AND password = crypt($(password), password);
`;

  const row = await db.oneOrNone<Row>(query, input);

  return {
    user: row
      ? {
          ...row,
          dateCreated: row.date_created,
          dateUpdated: row.date_updated,
        }
      : null,
  };
}

interface Row {
  id: string;
  date_created: Date;
  date_updated: Date;
  email: string;
  password: string;
}
