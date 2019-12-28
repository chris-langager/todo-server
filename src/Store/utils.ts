import * as pgPromise from 'pg-promise';
const pgp = pgPromise();

export function bulkUpsert(data: object[], key: string, columnSet: pgPromise.ColumnSet) {
  let query = pgp.helpers.insert(data, columnSet);
  query += ` ON CONFLICT (${key}) DO UPDATE SET ${columnSet.columns
    .filter(column => column.name !== key)
    .map(column => `${column.name} = EXCLUDED.${column.name}`)
    .join(', ')};`;
  return query;
}
