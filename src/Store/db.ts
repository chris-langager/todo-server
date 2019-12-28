import { IMain, IDatabase } from 'pg-promise';
import * as pgPromise from 'pg-promise';
import { CONFIG } from '../config';

const pgp: IMain = pgPromise();
export const db: IDatabase<any> = pgp(CONFIG.POSTGRES_DATABASE_URL);
