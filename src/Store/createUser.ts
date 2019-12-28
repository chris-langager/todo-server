import { User } from '../types';
import { db } from './db';
import { Context } from '../context';

export interface Input {
  user: User;
  password: string;
}

export async function createUser(ctx: Context, input: Input): Promise<{}> {
  const query = `
INSERT INTO users (id, date_created, date_updated ,email, password) VALUES
  ($(id), $(dateCreated), $(dateUpdated), $(email), crypt($(password), gen_salt('bf', 8)));
`;

  await db.none(query, {
    ...input.user,
    date_created: input.user.dateCreated,
    date_updated: input.user.dateUpdated,
    password: input.password
  });

  return {};
}
