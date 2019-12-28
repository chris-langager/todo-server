import { GraphqlContext } from './context';
import { Resolvers } from './generated/resolvers';
import Service from '../Service';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    test: () => 'hi there'
  },
  Mutation: {
    createUser: async (_, args, ctx) => {
      return Service.createUser(ctx, {
        createUserInput: {
          ...args.input
        }
      });
    },
    loginUser: async (_, args, ctx) => {
      return Service.loginUser(ctx, {
        loginUserInput: {
          ...args.input
        }
      });
    }
  }
};

//helper to take our domain types that have cursors on them and convert them to GQL "edges"
function toEdges<T extends { cursor?: string }>(
  tt: T[]
): { node: T; cursor?: string }[] {
  return tt.map(t => ({
    node: t,
    cursor: t.cursor
  }));
}
