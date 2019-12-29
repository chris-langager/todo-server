export const CONFIG = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  RUN_PORT: process.env.RUN_PORT || '5000',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgres://postgres:passw0rd@localhost:5432/postgres',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'boggle',
};
