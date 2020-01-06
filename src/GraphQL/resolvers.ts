import { TOKEN } from './cookies';
import { GraphqlContext } from './context';
import { Resolvers } from './generated/resolvers';
import TodoService from '../todo/service';
import UserService from '../user/service';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    self: async (_, __, ctx) => {
      const { token } = ctx;
      if (!token) {
        return null;
      }
      const { user } = await UserService.getSelf(ctx, {});
      return user;
    },
    todos: async (_, args, ctx) => {
      const { todos } = await TodoService.listTodos(ctx, {});
      return todos;
    },
  },
  Mutation: {
    createUser: async (_, args, ctx) => {
      return UserService.createUser(ctx, args.input);
    },
    loginUser: async (_, args, ctx) => {
      const { user, accessToken } = await UserService.loginUser(ctx, args.input);
      ctx.res.cookie(TOKEN, accessToken, { maxAge: 900000, httpOnly: true });
      return { user, accessToken };
    },
    loginWithGoogle: async (_, args, ctx) => {
      const { user, accessToken } = await UserService.loginWithGoogle(ctx, args.input);
      ctx.res.cookie(TOKEN, accessToken, { maxAge: 900000, httpOnly: true });
      return { user, accessToken };
    },
    logout: async (_, __, ctx) => {
      ctx.res.clearCookie(TOKEN);
      return true;
    },
    upsertTodos: async (_, args, ctx) => {
      return TodoService.upsertTodos(ctx, {
        upsertTodoInputs: args.input.upsertTodoInputs,
      });
    },
  },
};

//helper to take our domain types that have cursors on them and convert them to GQL "edges"
function toEdges<T extends { cursor?: string }>(tt: T[]): { node: T; cursor?: string }[] {
  return tt.map(t => ({
    node: t,
    cursor: t.cursor,
  }));
}
