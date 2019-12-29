import { GraphqlContext } from './context';
import { Resolvers } from './generated/resolvers';
import Service from '../Service';

export const resolvers: Resolvers<GraphqlContext> = {
  Query: {
    todos: async (_, args, ctx) => {
      const { todos } = await Service.listTodos(ctx, {});
      return todos;
    },
    test: async () => {
      console.log('test resolver called');
      return {
        // a: 'this is from test',
        b: 'this is from test',
      };
    },
  },
  Test: {
    a: async test => {
      if (test.a) {
        return test.a;
      }
      console.log('a resolver called');
      return 'this is from a';
    },
    b: async test => {
      console.log('b resolver called');
      return 'this is from b';
    },
  },
  Mutation: {
    createUser: async (_, args, ctx) => {
      return Service.createUser(ctx, {
        createUserInput: args.input,
      });
    },
    loginUser: async (_, args, ctx) => {
      return Service.loginUser(ctx, {
        loginUserInput: args.input,
      });
    },
    upsertTodos: async (_, args, ctx) => {
      return Service.upsertTodos(ctx, {
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
