import { ApolloServer } from 'apollo-server-express';
import { context } from './context';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

export const server = new ApolloServer({
  typeDefs,
  //@ts-ignore
  resolvers,
  context,
  introspection: true,
  playground: true
});
