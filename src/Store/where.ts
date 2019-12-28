import { keyBy } from 'lodash';

export type Filters = Record<string, number | number[] | string | string[]>;

export interface FilterMapping {
  jsonProperty: string;
  sqlProperty: string;
  operator: 'IN' | '>';
}

export function buildWhereClause(input: {
  filters?: Filters;
  mappings: FilterMapping[];
}): { where: string; bindVars: Record<string, any> } {
  const { filters, mappings } = input;
  //if there's no filters, then there's not going to be a where clause
  if (!filters) {
    return { where: '', bindVars: {} };
  }

  const filtersList = Object.keys(filters)
    .filter(key => filters[key] !== undefined)
    .map(key => ({ property: key, value: filters[key] }));

  //if no filters defined a value, then there's not going to be a where clause
  if (filtersList.length === 0) {
    return { where: '', bindVars: {} };
  }

  const mappingsByJsonProperty = keyBy(mappings, mapping => mapping.jsonProperty);

  const parts = filtersList.map(filter => {
    const { property, value } = filter;

    const mapping = mappingsByJsonProperty[property];
    if (!mapping) {
      throw new Error(
        `filter '${property}' passed into buildWhereCluase without a mapping`
      );
    }

    const { sqlProperty, operator } = mapping;

    //arrays bind a bit differently
    const valueBinding = Array.isArray(value) ? `($(${property}:csv))` : `$(${property})`;
    return `${sqlProperty} ${operator} ${valueBinding}`;
  });

  const where = `WHERE ${parts.join(' AND ')}`;

  return { where, bindVars: filters };
}
