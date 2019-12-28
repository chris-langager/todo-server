import { logger } from './logger';
import * as cors from 'cors';
import * as express from 'express';
import { CONFIG } from './config';
import { server } from './GraphQL';
import * as Store from './Store';
import * as bodyParser from 'body-parser';

(async () => {
  logger.info({ ENV: CONFIG }, 'starting up!');

  //   await Store.migrate();

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.use('/healthy', async (req, res) => {
    res.send({
      message: 'we up'
    });
  });

  server.applyMiddleware({ app, path: '/graphql' });

  app.listen({ port: CONFIG.RUN_PORT }, () => {
    logger.info(`pos-config-gql listening at :${CONFIG.RUN_PORT}...`);
  });
})();
