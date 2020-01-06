import { Context } from '../../context';
import { listUsers } from './listUsers';

//nice API for getting a single user wrapping our listUsers function
export async function getUserById(ctx: Context, input: { id: string }) {
  const { users } = await listUsers(ctx, { where: { ids: [input.id] } });

  return { user: users.length > 0 ? users[0] : null };
}

export async function getUserByEmail(ctx: Context, input: { email: string }) {
  const { users } = await listUsers(ctx, { where: { emails: [input.email] } });

  return { user: users.length > 0 ? users[0] : null };
}
