import { CONFIG } from '../config';
import { execSync } from 'child_process';
import { logger } from '../logger';

export async function migrate() {
  try {
    execSync(`npx db-migrate up --env all`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: CONFIG.POSTGRES_DATABASE_URL,
      },
    });
  } catch (e) {
    logger.fatal({ e }, 'there was an error running db migrations:');
    process.exit(1);
  }
}
