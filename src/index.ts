import { logger } from './logger';
import * as cors from 'cors';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { CONFIG } from './config';
import { server } from './GraphQL';
import * as Store from './Store';

(async () => {
  logger.info({ CONFIG }, 'starting up!');

  await Store.migrate();

  const app = express();

  var corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true, // <-- REQUIRED backend setting
  };

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(bodyParser.json());
  server.applyMiddleware({ app, path: '/graphql', cors: false });

  app.listen({ port: CONFIG.PORT }, () => {
    logger.info(`pos-config-gql listening at :${CONFIG.PORT}...`);
  });
})();
